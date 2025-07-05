import {
  AccountLogin,
  AccountLogout,
  AccountRefresh,
  AccountRegister,
  RpcStatus,
} from '@big-d/api-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUseCase, LogoutUseCase, RefreshUseCase, RegisterUseCase } from './use-cases';

@Controller()
export class AuthController {
  constructor(
    private readonly refreshUseCase: RefreshUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @MessagePattern(AccountRegister.pattern)
  async register(@Payload() { data }: AccountRegister.Request): Promise<AccountRegister.Response> {
    const { sessionToken, accessToken } = await this.registerUseCase.execute({
      email: data.login,
      userAgent: data.userAgent,
      ip: data.ip,
      password: data.password,
    });

    return { data: { refreshToken: sessionToken, accessToken } };
  }

  @MessagePattern(AccountRefresh.pattern)
  async refreshToken(
    @Payload() { data }: AccountRefresh.Request,
  ): Promise<AccountRefresh.Response> {
    const { sessionToken, accessToken } = await this.refreshUseCase.execute({
      sessionToken: data.refreshToken,
      ip: data.ip,
      userAgent: data.userAgent,
    });
    return { data: { refreshToken: sessionToken, accessToken } };
  }

  @MessagePattern(AccountLogin.pattern)
  async login(@Payload() { data }: AccountLogin.Request): Promise<AccountLogin.Response> {
    const { sessionToken, accessToken } = await this.loginUseCase.execute({
      login: data.login,
      password: data.password,
      ip: data.ip,
      userAgent: data.userAgent,
    });

    return { data: { refreshToken: sessionToken, accessToken } };
  }

  @MessagePattern(AccountLogout.pattern)
  async logout(@Payload() { data }: AccountLogout.Request): Promise<AccountLogout.Response> {
    await this.logoutUseCase.execute({
      userId: data.userId,
      userAgent: data.userAgent,
    });

    return { data: { stats: RpcStatus.SUCCESS } };
  }
}
