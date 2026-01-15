import { GetInboxByUserIdQuery } from '@/modules/tasks/application/queries';
import { CreateInboxGroupCommand } from '@/modules/tasks/application/use-cases';
import { GoalCreateInboxGroup, GoalGetGroupInBox } from '@big-d/api-contracts';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class GroupsInboxRmqController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(GoalCreateInboxGroup.pattern)
  async createInboxGroup(
    @Payload() { data: payload }: GoalCreateInboxGroup.Request,
  ): Promise<GoalCreateInboxGroup.Response> {
    return {
      data: await this.commandBus.execute(new CreateInboxGroupCommand({ userId: payload.userId })),
    };
  }

  @MessagePattern(GoalGetGroupInBox.pattern)
  async getInboxGroup(
    @Payload() { data: payload }: GoalGetGroupInBox.Request,
  ): Promise<GoalGetGroupInBox.Response> {
    const { tasks } = await this.queryBus.execute(
      new GetInboxByUserIdQuery({ userId: payload.userId }),
    );
    return {
      data: tasks,
    };
  }
}
