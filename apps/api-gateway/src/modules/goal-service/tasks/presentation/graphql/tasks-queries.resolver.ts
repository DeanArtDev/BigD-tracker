import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { AvailableInboxTasksStatuses, GoalGetTaskById, GoalGetTasks } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { GetTaskByIdInput, GetTasksInput, TaskSchema, TasksConnection } from './schemas';

@Resolver(() => TaskSchema)
class TasksQueriesResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Query(() => TasksConnection, {
    description: 'Получение списка дел',
  })
  async getTasks(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Args('input') input: GetTasksInput,
  ): Promise<TasksConnection> {
    const { status, limit, cursor, search, priority, groupIds, ids } = input;
    const availableStatuses =
      status?.filter((i) => AvailableInboxTasksStatuses.includes(i)) ?? AvailableInboxTasksStatuses;

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
      items: data.items,
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
