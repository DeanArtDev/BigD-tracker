import { GetMeHandler, GetMeQuery } from '@/modules/auth/application/queries';
import { AuthGetMe } from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Controller, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class UserRmqController {
  constructor(private readonly queryBus: QueryBus) {}

  @MessagePattern(AuthGetMe.pattern)
  async createTask(@Payload() { data }: AuthGetMe.Request): Promise<AuthGetMe.Response> {
    return {
      data: await this.queryBus.execute<GetMeQuery, ReturnHandlerType<typeof GetMeHandler>>(
        new GetMeQuery({
          userId: data.id,
        }),
      ),
    };
  }
}
