import {
  GetAssignableTasksQuery,
  GetDiaryTasksHandler,
  GetDiaryTasksQuery,
  GetTaskByIdHandler,
  GetTaskByIdQuery,
  GetTaskSettingsHandler,
  GetTaskSettingsQuery,
  GetTasksByRangeHandler,
  GetTasksByRangeQuery,
  GetTasksHandler,
  GetTasksPerPageHandler,
  GetTasksPerPageQuery,
  GetTasksQuery,
} from '@/modules/tasks/application/queries';
import {
  AssignTaskToGroupCommand,
  CloneTaskCommand,
  CompleteDeleteTaskCommand,
  CreateTaskCommand,
  FinishTaskCommand,
  FinishTaskHandler,
  ReplaceTaskCommand,
  SoftDeleteTaskCommand,
  TaskRecoveryCommand,
  UnassignTaskFromGroupCommand,
  UpdateTaskSettingsCommand,
  UpdateTaskSettingsHandler,
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
  GoalGetTaskById,
  GoalGetTaskSettings,
  GoalGetTasksCursor,
  GoalGetTasksPerPage,
  GoalGetTasksByRange,
  GoalReplaceTask,
  GoalTaskRecovery,
  GoalUnassignTaskFromGroup,
  GoalUpdateTaskSettings,
} from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CursorPaginationService } from '@shared/cursor-pagination';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class TasksRmqController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly cursorPaginationService: CursorPaginationService,
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
        }),
      ),
    };
  }

  @MessagePattern(GoalUpdateTaskSettings.pattern)
  async updateTaskSettings(
    @Payload() { data: payload }: GoalUpdateTaskSettings.Request,
  ): Promise<GoalUpdateTaskSettings.Response> {
    const { taskId, userId, ...patch } = payload;
    const settings = await this.commandBus.execute<
      UpdateTaskSettingsCommand,
      ReturnHandlerType<typeof UpdateTaskSettingsHandler>
    >(new UpdateTaskSettingsCommand({ taskId, userId, ...patch }));

    return {
      data: {
        taskId,
        icon: settings.icon,
        isAllDay: settings.isAllDay,
      },
    };
  }

  @MessagePattern(GoalGetTaskSettings.pattern)
  async getTaskSettings(
    @Payload() { data: payload }: GoalGetTaskSettings.Request,
  ): Promise<GoalGetTaskSettings.Response> {
    return {
      data: await this.queryBus.execute<GetTaskSettingsQuery, ReturnHandlerType<typeof GetTaskSettingsHandler>>(
        new GetTaskSettingsQuery(payload),
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

  @MessagePattern(GoalGetTasksCursor.pattern)
  async getTasksCursor(@Payload() { data: payload }: GoalGetTasksCursor.Request): Promise<GoalGetTasksCursor.Response> {
    const { userId, order, filter, search } = payload;
    const { ids, groupIds, priority, status, limit, cursor } = filter ?? {};
    const requestCursorPayload = this.cursorPaginationService.decodeCursorString(cursor);
    const lid = typeof requestCursorPayload?.lastId === 'string' ? requestCursorPayload.lastId : undefined;

    const requestFilter = {
      ids,
      groupIds,
      priority,
      status,
    };

    const tasks = await this.queryBus.execute<GetTasksQuery, ReturnHandlerType<typeof GetTasksHandler>>(
      new GetTasksQuery({
        userId,
        search,
        order,
        limit,
        filter: { ...requestFilter, lastId: lid },
      }),
    );

    const { nextCursor, hasNext } = this.cursorPaginationService.getNextCursor({
      search,
      filter: { ...requestFilter, order },
      limit,
      lastId: tasks.at(-1)?.id.toString(),
      currentPartLength: tasks.length,
    });

    return {
      data: {
        items: tasks,
        meta: { endCursor: nextCursor, hasNextPage: hasNext },
      },
    };
  }

  @MessagePattern(GoalGetTasksPerPage.pattern)
  async getTasksPerPage(
    @Payload() { data: payload }: GoalGetTasksPerPage.Request,
  ): Promise<GoalGetTasksPerPage.Response> {
    const { userId, order, filter, search, sort, page, perPage } = payload;

    const tasks = await this.queryBus.execute<GetTasksPerPageQuery, ReturnHandlerType<typeof GetTasksPerPageHandler>>(
      new GetTasksPerPageQuery({
        userId,
        order,
        filter,
        search,
        sort,
        page,
        perPage,
      }),
    );

    return {
      data: {
        items: tasks,
        meta: { nextPage: tasks.length >= perPage },
      },
    };
  }

  @MessagePattern(GoalGetTaskById.pattern)
  async getTaskById(@Payload() { data: payload }: GoalGetTaskById.Request): Promise<GoalGetTaskById.Response> {
    return {
      data: await this.queryBus.execute<GetTaskByIdQuery, ReturnHandlerType<typeof GetTaskByIdHandler>>(
        new GetTaskByIdQuery({
          userId: payload.userId,
          taskId: payload.taskId,
        }),
      ),
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
          groupIds: payload.groupIds,
        }),
      ),
    };
  }

  @MessagePattern(GoalFinishTask.pattern)
  async finishTask(@Payload() { data: payload }: GoalFinishTask.Request): Promise<GoalFinishTask.Response> {
    const data = await this.commandBus.execute<FinishTaskCommand, ReturnHandlerType<typeof FinishTaskHandler>>(
      new FinishTaskCommand({
        userId: payload.userId,
        taskId: payload.taskId,
        reason: payload.reason,
        type: payload.type,
      }),
    );
    return { data };
  }
}
