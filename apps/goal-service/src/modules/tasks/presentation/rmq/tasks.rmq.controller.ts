import {
  GetAssignableTasksQuery,
  GetDiaryTasksHandler,
  GetDiaryTasksQuery,
  GetTasksByRangeHandler,
  GetTasksByRangeQuery,
  GetTasksHandler,
  GetTasksQuery,
} from '@/modules/tasks/application/queries';
import {
  AssignTaskToGroupCommand,
  CloneTaskCommand,
  CompleteDeleteTaskCommand,
  CreateTaskCommand,
  FinishTaskCommand,
  ReplaceTaskCommand,
  SoftDeleteTaskCommand,
  TaskRecoveryCommand,
  UnassignTaskFromGroupCommand,
} from '@/modules/tasks/application/use-cases';
import {
  GoalAssignTaskToGroup,
  GoalCloneTask,
  GoalCompleteDeleteTask,
  GoalCreateTask,
  GoalDeleteTask,
  GoalFinishTask,
  GoalGetAssignableTasks,
  GoalGetDiaryTasks,
  GoalGetTasks,
  GoalReplaceTask,
  GoalTaskRecovery,
  GoalUnassignTaskFromGroup,
} from '@big-d/api-contracts';
import { GoalGetTasksByRange } from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class TasksRmqController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(GoalCreateTask.pattern)
  async createTask(@Payload() { data: payload }: GoalCreateTask.Request): Promise<GoalCreateTask.Response> {
    return {
      data: await this.commandBus.execute(
        new CreateTaskCommand({
          userId: payload.userId,
          groupId: payload.groupId,
          priority: payload.priority,
          name: payload.name,
          description: payload.description,
          startDate: payload.startDate,
          deadline: payload.deadline,
          recurrence: payload.recurrence,
          weight: payload.weight,
        }),
      ),
    };
  }

  @MessagePattern(GoalCloneTask.pattern)
  async cloneTask(@Payload() { data: payload }: GoalCloneTask.Request): Promise<GoalCloneTask.Response> {
    return {
      data: await this.commandBus.execute(
        new CloneTaskCommand({
          userId: payload.userId,
          taskId: payload.taskId,
        }),
      ),
    };
  }

  @MessagePattern(GoalReplaceTask.pattern)
  async replaceTask(@Payload() { data: payload }: GoalReplaceTask.Request): Promise<GoalReplaceTask.Response> {
    return {
      data: await this.commandBus.execute(
        new ReplaceTaskCommand({
          name: payload.name,
          id: payload.id,
          userId: payload.userId,
          weight: payload.weight,
          description: payload.description,
          priority: payload.priority,
          startDate: payload.startDate,
          deadline: payload.deadline,
          recurrence: payload.recurrence,
        }),
      ),
    };
  }

  @MessagePattern(GoalDeleteTask.pattern)
  async deleteTask(@Payload() { data: payload }: GoalDeleteTask.Request): Promise<GoalDeleteTask.Response> {
    return {
      data: await this.commandBus.execute(new SoftDeleteTaskCommand(payload)),
    };
  }

  @MessagePattern(GoalCompleteDeleteTask.pattern)
  async completeDeleteTask(
    @Payload() { data: payload }: GoalCompleteDeleteTask.Request,
  ): Promise<GoalCompleteDeleteTask.Response> {
    return {
      data: await this.commandBus.execute(new CompleteDeleteTaskCommand(payload)),
    };
  }

  @MessagePattern(GoalTaskRecovery.pattern)
  async taskRecovery(@Payload() { data: payload }: GoalTaskRecovery.Request): Promise<GoalTaskRecovery.Response> {
    return {
      data: await this.commandBus.execute(
        new TaskRecoveryCommand({
          userId: payload.userId,
          taskId: payload.taskId,
          groupId: payload.groupId,
        }),
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

  @MessagePattern(GoalUnassignTaskFromGroup.pattern)
  async unassignTaskFromGroup(
    @Payload() { data: payload }: GoalUnassignTaskFromGroup.Request,
  ): Promise<GoalUnassignTaskFromGroup.Response> {
    return {
      data: await this.commandBus.execute(
        new UnassignTaskFromGroupCommand({
          taskId: payload.taskId,
          userId: payload.userId,
          groupId: payload.groupId,
        }),
      ),
    };
  }

  @MessagePattern(GoalGetTasks.pattern)
  async getTasks(@Payload() { data: payload }: GoalGetTasks.Request): Promise<GoalGetTasks.Response> {
    const { userId, ids, groupIds } = payload;

    const tasks = await this.queryBus.execute<GetTasksQuery, ReturnHandlerType<typeof GetTasksHandler>>(
      new GetTasksQuery({
        userId,
        ids,
        groupIds,
      }),
    );

    return {
      data: {
        items: tasks,
      },
    };
  }

  @MessagePattern(GoalGetTasksByRange.pattern)
  async getTasksByRange(
    @Payload() { data: payload }: GoalGetTasksByRange.Request,
  ): Promise<GoalGetTasksByRange.Response> {
    const { userId, search, filter, sort, page, perPage } = payload;

    const tasks = await this.queryBus.execute<GetTasksByRangeQuery, ReturnHandlerType<typeof GetTasksByRangeHandler>>(
      new GetTasksByRangeQuery({
        userId,
        meta: { search, filter, sort, page, perPage },
      }),
    );

    return {
      data: {
        items: tasks,
        meta: { nextPage: perPage <= tasks.length },
      },
    };
  }

  @MessagePattern(GoalGetDiaryTasks.pattern)
  async getDiaryTasks(@Payload() { data: payload }: GoalGetDiaryTasks.Request): Promise<GoalGetDiaryTasks.Response> {
    const { userId, filter } = payload;

    const tasks = await this.queryBus.execute<GetDiaryTasksQuery, ReturnHandlerType<typeof GetDiaryTasksHandler>>(
      new GetDiaryTasksQuery({
        userId,
        meta: { filter },
      }),
    );

    return {
      data: {
        items: tasks,
      },
    };
  }

  @MessagePattern(GoalGetAssignableTasks.pattern)
  async getAssignableTasks(
    @Payload() { data: payload }: GoalGetAssignableTasks.Request,
  ): Promise<GoalGetAssignableTasks.Response> {
    return {
      data: await this.queryBus.execute(
        new GetAssignableTasksQuery({
          userId: payload.userId,
          search: payload.search,
        }),
      ),
    };
  }

  @MessagePattern(GoalFinishTask.pattern)
  async finishTask(@Payload() { data: payload }: GoalFinishTask.Request): Promise<GoalFinishTask.Response> {
    await this.commandBus.execute(
      new FinishTaskCommand({
        userId: payload.userId,
        taskId: payload.taskId,
        reason: payload.reason,
        type: payload.type,
      }),
    );
    return { data: true };
  }
}
