import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { TaskMapper } from '../mappers/task.mapper';
import {
  GoalGetAssignableTasks,
  GoalGetDiaryTasks,
  GoalGetTaskById,
  GoalGetTasksCursor,
  GoalGetTasksPerPage,
} from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { getTaskSettingsDataLoader } from './loaders';
import {
  GetAssignableTasksInput,
  GetDiaryTasksInput,
  GetTaskByIdInput,
  GetTasksCursorInput,
  GetTasksPerPageInput,
  TaskSchema,
  TaskSettingsSchema,
  TasksConnection,
  TasksPerPageConnection,
} from './schemas';

@Resolver(() => TaskSchema)
class TasksQueriesResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @ResolveField(() => TaskSettingsSchema)
  settings(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Parent() task: TaskSchema,
    @Context() context: AppGraphQLContext,
  ): Promise<TaskSettingsSchema> {
    return getTaskSettingsDataLoader({ context, goalClient: this.goalClient, userId: uid }).load(task.id);
  }

  @Query(() => [TaskSchema], {
    description: 'Получение списка дел, доступных для назначения в группу',
  })
  async getAssignableTasks(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Args('input') { search, groupIds }: GetAssignableTasksInput,
  ): Promise<TaskSchema[]> {
    const { data } = await this.goalClient.send<GoalGetAssignableTasks.Response, GoalGetAssignableTasks.Request>(
      GoalGetAssignableTasks.pattern,
      {
        data: {
          userId: uid,
          search,
          groupIds,
        },
      },
    );

    return data.map(TaskMapper.fromServerTaskDtoToClientDto);
  }

  @Query(() => [TaskSchema], {
    description: 'Получение дел для ежедневника',
  })
  async getDiaryTasks(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Args('input') { from, to, group }: GetDiaryTasksInput,
  ): Promise<TaskSchema[]> {
    const { data } = await this.goalClient.send<GoalGetDiaryTasks.Response, GoalGetDiaryTasks.Request>(
      GoalGetDiaryTasks.pattern,
      {
        data: {
          userId: uid,
          filter: {
            from,
            to,
            group,
          },
        },
      },
    );

    return data.items.map(TaskMapper.fromServerTaskDtoToClientDto);
  }

  @Query(() => TasksConnection, {
    description: 'Получение списка дел',
  })
  async getTasksCursor(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Args('input') input: GetTasksCursorInput,
  ): Promise<TasksConnection> {
    const { status, limit, cursor, search, priority, groupIds, ids } = input;

    const { data } = await this.goalClient.send<GoalGetTasksCursor.Response, GoalGetTasksCursor.Request>(
      GoalGetTasksCursor.pattern,
      {
        data: {
          userId: uid,
          search,
          filter: {
            limit,
            cursor,
            priority: priority?.map(TaskMapper.fromClientPriorityToServer),
            status,
            groupIds,
            ids,
          },
        },
      },
    );

    return {
      items: data.items.map(TaskMapper.fromServerTaskDtoToClientDto),
      meta: data.meta,
    };
  }

  @Query(() => TasksPerPageConnection, {
    description: 'Получение списка дел с постраничной пагинацией',
  })
  async getTasksPerPage(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Args('input') input: GetTasksPerPageInput,
  ): Promise<TasksPerPageConnection> {
    const { status, page, perPage, search, sort, recurring, priority, groupIds, ids } = input;

    const { data } = await this.goalClient.send<GoalGetTasksPerPage.Response, GoalGetTasksPerPage.Request>(
      GoalGetTasksPerPage.pattern,
      {
        data: {
          userId: uid,
          page,
          perPage,
          search,
          sort,
          filter: {
            recurring,
            priority: priority?.map(TaskMapper.fromClientPriorityToServer),
            status,
            groupIds,
            ids,
          },
        },
      },
    );

    return {
      items: data.items.map(TaskMapper.fromServerTaskDtoToClientDto),
      meta: data.meta,
    };
  }

  @Query(() => TaskSchema, {
    description: 'Получение дела по id',
  })
  async getTaskById(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Args('input') input: GetTaskByIdInput,
  ): Promise<GoalGetTaskById.Response['data']> {
    const { data } = await this.goalClient.send<GoalGetTaskById.Response, GoalGetTaskById.Request>(
      GoalGetTaskById.pattern,
      {
        data: {
          userId: uid,
          taskId: input.id,
        },
      },
    );

    return data;
  }
}

export { TasksQueriesResolver };
