import {
  CreateTaskCommand,
  UpdateInboxTaskCommand,
  ReplaceTaskCommand,
  CloneTaskCommand,
} from '@/modules/tasks/application/use-cases';
import { SoftDeleteTaskCommand } from '@/modules/tasks/application/use-cases/soft-delete-task';
import {
  GoalCloneTask,
  GoalCreateTask,
  GoalDeleteTask,
  GoalReplaceTask,
  GoalUpdateInboxTask,
} from '@big-d/api-contracts';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class TasksRpcController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(GoalCreateTask.pattern)
  async createTask(
    @Payload() { data: payload }: GoalCreateTask.Request,
  ): Promise<GoalCreateTask.Response> {
    return {
      data: await this.commandBus.execute(new CreateTaskCommand(payload)),
    };
  }

  @MessagePattern(GoalCloneTask.pattern)
  async cloneTask(
    @Payload() { data: payload }: GoalCloneTask.Request,
  ): Promise<GoalCloneTask.Response> {
    return {
      data: await this.commandBus.execute(
        new CloneTaskCommand({
          userId: payload.userId,
          taskId: payload.taskId,
          groupId: payload.groupId,
        }),
      ),
    };
  }

  @MessagePattern(GoalReplaceTask.pattern)
  async replaceTask(
    @Payload() { data: payload }: GoalReplaceTask.Request,
  ): Promise<GoalReplaceTask.Response> {
    return {
      data: await this.commandBus.execute(new ReplaceTaskCommand(payload)),
    };
  }

  @MessagePattern(GoalUpdateInboxTask.pattern)
  async updateInboxTask(
    @Payload() { data: payload }: GoalUpdateInboxTask.Request,
  ): Promise<GoalUpdateInboxTask.Response> {
    return {
      data: await this.commandBus.execute(new UpdateInboxTaskCommand(payload)),
    };
  }

  @MessagePattern(GoalDeleteTask.pattern)
  async deleteTask(
    @Payload() { data: payload }: GoalDeleteTask.Request,
  ): Promise<GoalDeleteTask.Response> {
    return {
      data: await this.commandBus.execute(
        new SoftDeleteTaskCommand({ taskId: payload.id, userId: payload.userId }),
      ),
    };
  }
}
