import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { TaskMapper, TasksConnection } from '@/modules/goal-service/tasks';
import {
  AvailableToViewTasksStatuses,
  GoalGetAssignableGroups,
  GoalGetGroup,
  GoalGetGroupInfo,
  GoalGetGroupList,
  GoalGetTasks,
} from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import {
  GetGroupInput,
  GetGroupListInput,
  GroupSchema,
  GroupInfoSchema,
  GetGroupTasksInput,
  GroupsConnection,
} from '../schemas';

@Resolver(() => GroupSchema)
export class GroupsQueriesResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Query(() => [GroupInfoSchema])
  async getAssignableGroups(@TokenPayload() { uid }: AccessTokenPayload): Promise<GroupInfoSchema[]> {
    const { data } = await this.goalClient.send<GoalGetAssignableGroups.Response, GoalGetAssignableGroups.Request>(
      GoalGetAssignableGroups.pattern,
      { data: { userId: uid } },
    );

    return data;
  }

  @Query(() => GroupsConnection, {
    description: 'Получение списка групп',
  })
  async getGroupList(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Args('input') input: GetGroupListInput,
  ): Promise<GroupsConnection> {
    const { data } = await this.goalClient.send<GoalGetGroupList.Response, GoalGetGroupList.Request>(
      GoalGetGroupList.pattern,
      {
        data: {
          userId: uid,
          limit: input.limit,
          cursor: input.cursor,
          search: input.search,
        },
      },
    );

    return {
      items: data.items,
      meta: data.meta,
    };
  }

  @Query(() => GroupSchema, {
    description: 'Получение группы',
  })
  async getGroup(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Args('input') input: GetGroupInput,
  ): Promise<GroupSchema> {
    const { data } = await this.goalClient.send<GoalGetGroup.Response, GoalGetGroup.Request>(GoalGetGroup.pattern, {
      data: { userId: uid, groupId: input.groupId },
    });

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.userId,
      progress: data.progress,
      status: data.status,
    };
  }

  @ResolveField(() => Int, { nullable: true })
  async taskCount(@TokenPayload() { uid }: AccessTokenPayload, @Parent() group: GroupSchema): Promise<number> {
    const { data } = await this.goalClient.send<GoalGetGroupInfo.Response, GoalGetGroupInfo.Request>(
      GoalGetGroupInfo.pattern,
      { data: { userId: uid, groupId: group.id } },
    );

    return data.taskCount;
  }

  @ResolveField(() => TasksConnection)
  async tasks(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Parent() group: GroupSchema,
    @Args('input', { nullable: true }) input?: GetGroupTasksInput,
  ): Promise<TasksConnection> {
    const { data } = await this.goalClient.send<GoalGetTasks.Response, GoalGetTasks.Request>(GoalGetTasks.pattern, {
      data: {
        userId: uid,
        order: input?.order,
        filter: {
          groupIds: [group.id],
          limit: 10000,
          status: AvailableToViewTasksStatuses,
        },
      },
    });

    return {
      items: data.items.map(TaskMapper.fromServerTaskDtoToClientDto),
      meta: data.meta,
    };
  }
}
