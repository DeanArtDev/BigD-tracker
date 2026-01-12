import { CreateGroupCommand } from '@/modules/tasks/application/use-cases';
import { GoalCreateGroup } from '@big-d/api-contracts';
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
}
