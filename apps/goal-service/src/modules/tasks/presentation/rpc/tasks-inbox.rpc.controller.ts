import { CreateTaskInInboxCommand } from '@/modules/tasks/application/use-cases';
import { GoalCreateTaskInInbox } from '@big-d/api-contracts';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class TasksInboxRpcController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(GoalCreateTaskInInbox.pattern)
  async createTaskIntoInbox(
    @Payload() { data: payload }: GoalCreateTaskInInbox.Request,
  ): Promise<GoalCreateTaskInInbox.Response> {
    return {
      data: await this.commandBus.execute(new CreateTaskInInboxCommand(payload)),
    };
  }
}
