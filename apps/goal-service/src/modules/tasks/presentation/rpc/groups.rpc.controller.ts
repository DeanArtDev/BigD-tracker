import { CreateGroupCommand, ReplaceGroupCommand } from '@/modules/tasks/application/use-cases';
import { GoalCreateGroup, GoalReplaceGroup } from '@big-d/api-contracts';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class GroupsRpcController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(GoalCreateGroup.pattern)
  async createGroup(
    @Payload() { data: payload }: GoalCreateGroup.Request,
  ): Promise<GoalCreateGroup.Response> {
    return {
      data: await this.commandBus.execute(
        new CreateGroupCommand({
          userId: payload.userId,
          name: payload.name,
          description: payload.description,
        }),
      ),
    };
  }

  @MessagePattern(GoalReplaceGroup.pattern)
  async replaceGroup(
    @Payload() { data: payload }: GoalReplaceGroup.Request,
  ): Promise<GoalReplaceGroup.Response> {
    return {
      data: await this.commandBus.execute(
        new ReplaceGroupCommand({
          id: payload.id,
          userId: payload.userId,
          name: payload.name,
          description: payload.description,
          tasks: payload.tasks,
        }),
      ),
    };
  }
}
