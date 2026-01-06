import { CreateInboxGroupCommand } from '@/modules/tasks/application/use-cases';
import { GoalCreateInboxGroup } from '@big-d/api-contracts';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class GroupsInboxRpcController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(GoalCreateInboxGroup.pattern)
  async createInboxGroup(
    @Payload() { data: payload }: GoalCreateInboxGroup.Request,
  ): Promise<GoalCreateInboxGroup.Response> {
    return {
      data: await this.commandBus.execute(new CreateInboxGroupCommand({ userId: payload.userId })),
    };
  }
}
