import { ACCOUNT_APP_ENV } from '@/infrastructure/configs';
import {
  AuthLogin,
  AuthLogout,
  AccountReferralToken,
  AuthRefresh,
  AuthRegister,
  RpcStatus,
} from '@big-d/api-contracts';
import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUseCase, LogoutUseCase, ReferralTokenCommand, RefreshUseCase, RegisterUseCase } from './use-cases';

@Controller()
export class AuthController {
  constructor(
    private readonly refreshUseCase: RefreshUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly commandBus: CommandBus,
    private readonly config: ConfigService<ACCOUNT_APP_ENV>,
  ) {}

  @MessagePattern(AuthRegister.pattern)
  async register(@Payload() { data }: AuthRegister.Request): Promise<AuthRegister.Response> {
    const { sessionToken, accessToken } = await this.registerUseCase.execute({
      email: data.login,
      userAgent: data.userAgent,
      ip: data.ip,
      password: data.password,
    });

    return {
      data: {
        refreshToken: sessionToken,
        accessToken,
        maxAge: this.config.get<number>('SESSION_REFRESH_TIME', 0),
      },
    };
  }

  @MessagePattern(AuthRefresh.pattern)
  async refreshToken(@Payload() { data }: AuthRefresh.Request): Promise<AuthRefresh.Response> {
    const { accessToken } = await this.refreshUseCase.execute({
      sessionToken: data.refreshToken,
      ip: data.ip,
      userAgent: data.userAgent,
    });

    return {
      data: {
        accessToken,
        maxAge: this.config.get<number>('SESSION_REFRESH_TIME', 0),
      },
    };
  }

  @MessagePattern(AuthLogin.pattern)
  async login(@Payload() { data }: AuthLogin.Request): Promise<AuthLogin.Response> {
    const { sessionToken, accessToken } = await this.loginUseCase.execute({
      login: data.login,
      password: data.password,
      ip: data.ip,
      userAgent: data.userAgent,
    });

    return {
      data: {
        refreshToken: sessionToken,
        accessToken,
        maxAge: this.config.get<number>('SESSION_REFRESH_TIME', 0),
      },
    };
  }

  @MessagePattern(AuthLogout.pattern)
  async logout(@Payload() { data }: AuthLogout.Request): Promise<AuthLogout.Response> {
    await this.logoutUseCase.execute({
      userId: data.userId,
      userAgent: data.userAgent,
    });

    return { data: { status: RpcStatus.SUCCESS } };
  }

  @MessagePattern(AccountReferralToken.pattern)
  async generateReferralToken(
    @Payload() { data }: AccountReferralToken.Request,
  ): Promise<AccountReferralToken.Response> {
    return {
      data: await this.commandBus.execute(
        new ReferralTokenCommand({ userId: data.uid, sessionId: data.sid.toString() }),
      ),
    };
  }
}
