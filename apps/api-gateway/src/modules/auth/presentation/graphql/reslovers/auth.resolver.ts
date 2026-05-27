import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { AppRmqClient, AUTH_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { ACCESS_TOKEN_KEY } from '@/modules/auth';
import { AuthErrorSkip, Public, REFRESH_TOKEN_KEY, RefreshToken, TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { ExceptionUnauthorized } from '@/modules/auth/exceptions';
import { AuthLogin, AuthRefresh } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Context, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { IpAddress } from '@shared/decorators/ip.decorator';
import { UserAgent } from '@shared/decorators/user-agent.decorator';
import { CookieService } from '@shared/services/cookies';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType()
export class LoginUserInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsString()
  @MinLength(6)
  password: string;
}

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
}
