import {
  UserLoginCommand,
  UserLoginHandler,
  UserLogoutCommand,
  UserLogoutHandler,
  UserRegistrationCommand,
  UserRegistrationHandler,
} from '@/modules/auth/application/user-cases';
import { AuthLogin, AuthLogout, AuthRegister } from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class AuthRmqController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(AuthRegister.pattern)
  async register(@Payload() { data }: AuthRegister.Request): Promise<AuthRegister.Response> {
    return {
      data: await this.commandBus.execute<UserRegistrationCommand, ReturnHandlerType<typeof UserRegistrationHandler>>(
        new UserRegistrationCommand({
          email: data.login,
          userAgent: data.userAgent,
          ip: data.ip,
          password: data.password,
        }),
      ),
    };
  }

  @MessagePattern(AuthLogin.pattern)
  async login(@Payload() { data }: AuthLogin.Request): Promise<AuthLogin.Response> {
    return {
      data: await this.commandBus.execute<UserLoginCommand, ReturnHandlerType<typeof UserLoginHandler>>(
        new UserLoginCommand({
          email: data.login,
          userAgent: data.userAgent,
          ip: data.ip,
          password: data.password,
        }),
      ),
    };
  }

  @MessagePattern(AuthLogout.pattern)
  async logout(@Payload() { data }: AuthLogout.Request): Promise<AuthLogout.Response> {
    return {
      data: await this.commandBus.execute<UserLogoutCommand, ReturnHandlerType<typeof UserLogoutHandler>>(
        new UserLogoutCommand({
          userId: data.userId,
          userAgent: data.userAgent,
          ip: data.ip,
        }),
      ),
    };
  }
}
