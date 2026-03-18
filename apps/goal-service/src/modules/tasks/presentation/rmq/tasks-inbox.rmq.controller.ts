import { CreateTaskInInboxCommand, UpdateInboxTaskCommand } from '@/modules/tasks/application/use-cases';
import { GoalCreateTaskInInbox, GoalUpdateInboxTask } from '@big-d/api-contracts';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class TasksInboxRmqController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(GoalCreateTaskInInbox.pattern)
  async createTaskIntoInbox(
    @Payload() { data: payload }: GoalCreateTaskInInbox.Request,
  ): Promise<GoalCreateTaskInInbox.Response> {
    return {
      data: await this.commandBus.execute(
        new CreateTaskInInboxCommand({
          userId: payload.userId,
          name: payload.name,
          description: payload.description,
          startDate: payload.startDate,
          deadline: payload.deadline,
          priority: payload.priority,
        }),
      ),
    };
  }

  @MessagePattern(GoalUpdateInboxTask.pattern)
  async updateInboxTask(
    @Payload() { data: payload }: GoalUpdateInboxTask.Request,
  ): Promise<GoalUpdateInboxTask.Response> {
    return {
      data: await this.commandBus.execute(
        new UpdateInboxTaskCommand({
          id: payload.id,
          userId: payload.userId,
          name: payload.name,
          description: payload.description,
          priority: payload.priority,
          startDate: payload.startDate,
          deadline: payload.deadline,
        }),
      ),
    };
  }
}
