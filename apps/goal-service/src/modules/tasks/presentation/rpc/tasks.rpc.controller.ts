import {
  AssignTaskToGroupCommand,
  CloneTaskCommand,
  CreateTaskCommand,
  ReplaceTaskCommand,
  SoftDeleteTaskCommand,
  UpdateInboxTaskCommand,
} from '@/modules/tasks/application/use-cases';
import {
  GoalCloneTask,
  GoalCreateTask,
  GoalDeleteTask,
  GoalReplaceTask,
  GoalUpdateInboxTask,
  GoalAssignTaskToGroup,
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
      data: await this.commandBus.execute(
        new CreateTaskCommand({
          userId: payload.userId,
          groupId: payload.groupId,
          priority: payload.priority,
          deadline: payload.deadline,
          name: payload.name,
          description: payload.description,
          recurrence: payload.recurrence,
          weight: payload.weight,
          startDate: payload.startDate,
        }),
      ),
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
      data: await this.commandBus.execute(
        new ReplaceTaskCommand({
          deadline: payload.deadline,
          name: payload.name,
          id: payload.id,
          userId: payload.userId,
          weight: payload.weight,
          startDate: payload.startDate,
          description: payload.description,
          recurrence: payload.recurrence,
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
          deadline: payload.deadline,
          description: payload.description,
          priority: payload.priority,
          startDate: payload.startDate,
        }),
      ),
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

  @MessagePattern(GoalAssignTaskToGroup.pattern)
  async assignTaskToGroup(
    @Payload() { data: payload }: GoalAssignTaskToGroup.Request,
  ): Promise<GoalAssignTaskToGroup.Response> {
    return {
      data: await this.commandBus.execute(
        new AssignTaskToGroupCommand({
          taskId: payload.taskId,
          userId: payload.userId,
          groupId: payload.groupId,
        }),
      ),
    };
  }
}
