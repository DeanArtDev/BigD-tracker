import { GetMeHandler, GetMeQuery } from '@/modules/auth/application/queries';
import { UserDeleteCommand, UserDeleteHandler } from '@/modules/auth/application/use-cases';
import { AuthDeleteUser, AuthGetMe } from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class UserRmqController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(AuthGetMe.pattern)
  async getMe(@Payload() { data }: AuthGetMe.Request): Promise<AuthGetMe.Response> {
    return {
      data: await this.queryBus.execute<GetMeQuery, ReturnHandlerType<typeof GetMeHandler>>(
        new GetMeQuery({
          userId: data.id,
        }),
      ),
    };
  }

  @MessagePattern(AuthDeleteUser.pattern)
  async deleteUser(@Payload() { data }: AuthDeleteUser.Request): Promise<AuthDeleteUser.Response> {
    return {
      data: await this.commandBus.execute<UserDeleteCommand, ReturnHandlerType<typeof UserDeleteHandler>>(
        new UserDeleteCommand({
          userId: data.id,
          userAgent: data.userAgent,
          ip: data.ip,
        }),
      ),
    };
  }
}
