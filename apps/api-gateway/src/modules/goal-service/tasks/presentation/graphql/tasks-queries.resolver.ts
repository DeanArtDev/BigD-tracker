import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { TaskMapper } from '../mappers/task.mapper';
import {
  AvailableToViewTasksStatuses,
  GoalGetAssignableTasks,
  GoalGetTaskById,
  GoalGetTasks,
} from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { GetAssignableTasksInput, GetTaskByIdInput, GetTasksInput, TaskSchema, TasksConnection } from './schemas';

@Resolver(() => TaskSchema)
class TasksQueriesResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

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

  @Query(() => TasksConnection, {
    description: 'Получение списка дел',
  })
  async getTasks(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Args('input') input: GetTasksInput,
  ): Promise<TasksConnection> {
    const { status, limit, cursor, search, priority, groupIds, ids } = input;
    const availableStatuses =
      status?.filter((i) => AvailableToViewTasksStatuses.includes(i)) ?? AvailableToViewTasksStatuses;

    const { data } = await this.goalClient.send<GoalGetTasks.Response, GoalGetTasks.Request>(GoalGetTasks.pattern, {
      data: {
        userId: uid,
        search,
        filter: {
          limit,
          cursor,
          priority,
          status: availableStatuses,
          groupIds,
          ids,
        },
      },
    });

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
