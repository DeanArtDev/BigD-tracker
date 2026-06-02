import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { AppRmqClient, AUTH_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { AuthErrorSkip, Public, REFRESH_TOKEN_KEY, RefreshToken, TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { ExceptionLogoutFailed, ExceptionUnauthorized } from '@/modules/auth/exceptions';
import { AuthLogin, AuthLogout, AuthRefresh, RpcStatus } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { IpAddress } from '@shared/decorators/ip.decorator';
import { UserAgent } from '@shared/decorators/user-agent.decorator';
import { CookieService } from '@shared/services/cookies';
import { LoginUserInput } from './schemas';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly cookieService: CookieService,
    @Inject(AUTH_RMQ_SERVICE) private readonly authClient: AppRmqClient,
  ) {}

  @Public()
  @Mutation(() => Boolean, {
    description: 'Логин по email/паролю. Выставляет httpOnly cookies access/refresh.',
  })
  async userLogin(
    @Args('input') input: LoginUserInput,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
    @Context() ctx: AppGraphQLContext,
  ): Promise<boolean> {
    const { password, email } = input;
    const {
      data: { refreshToken, accessToken, maxAge },
    } = await this.authClient.send<AuthLogin.Response, AuthLogin.Request>(AuthLogin.pattern, {
      data: { ip, userAgent, login: email, password },
    });

    this.cookieService.setRefreshTokenByKey(ACCESS_TOKEN_KEY, { token: accessToken, maxAge }, ctx.response);
    this.cookieService.setRefreshTokenByKey(REFRESH_TOKEN_KEY, { token: refreshToken, maxAge }, ctx.response);

    return true;
  }

  @AuthErrorSkip()
  @Mutation(() => Boolean)
  async refresh(
    @Context() ctx: AppGraphQLContext,
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
    @TokenPayload() accessTokenPayload?: AccessTokenPayload,
    @RefreshToken() refreshToken?: string,
  ): Promise<boolean> {
    if (accessTokenPayload == null) {
      throw new ExceptionUnauthorized({ message: 'Токен доступа отсутствует' });
    }

    if (refreshToken == null) {
      this.cookieService.dropTokens(ctx.response);
      throw new ExceptionUnauthorized({ message: 'Рефреш токен просрочен или не валидный' });
    }

    try {
      const { data } = await this.authClient.send<AuthRefresh.Response, AuthRefresh.Request>(AuthRefresh.pattern, {
        data: { ip, userAgent, refreshToken, sessionId: accessTokenPayload.sid, userId: accessTokenPayload.uid },
      });
      const { accessToken, maxAge } = data;
      this.cookieService.setRefreshTokenByKey(ACCESS_TOKEN_KEY, { token: accessToken, maxAge }, ctx.response);
    } catch {
      this.cookieService.dropTokens(ctx.response);
      throw new ExceptionUnauthorized({ message: 'Рефреш токен просрочен или не валидный' });
    }

    return true;
  }

  @Mutation(() => Boolean, {
    description: 'Выход пользователя из системы на одном устройстве',
  })
  async userLogout(
    @IpAddress() ip: string,
    @UserAgent() userAgent: string,
    @TokenPayload() { uid }: AccessTokenPayload,
    @Context() ctx: AppGraphQLContext,
  ): Promise<boolean> {
    const {
      data: { status },
    } = await this.authClient.send<AuthLogout.Response, AuthLogout.Request>(AuthLogout.pattern, {
      data: { ip, userAgent, userId: uid },
    });

    if (status === RpcStatus.FAILED) {
      throw new ExceptionLogoutFailed({ message: 'Logout failed', userId: uid });
    }

    this.cookieService.dropTokens(ctx.response);
    return true;
  }
}
