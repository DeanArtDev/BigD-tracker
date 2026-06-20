import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { TasksConnection } from '@/modules/goal-service/tasks';
import {
  AvailableToViewTasksStatuses,
  GoalGetAssignableGroups,
  GoalGetGroup,
  GoalGetTasks,
} from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GetGroupInput, GroupSchema, GroupInfoDto, GetGroupTasksInput } from '../schemas';

@Resolver(() => GroupSchema)
export class GroupsQueriesResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Query(() => [GroupInfoDto])
  async getAssignableGroups(@TokenPayload() { uid }: AccessTokenPayload): Promise<GroupInfoDto[]> {
    const { data } = await this.goalClient.send<GoalGetAssignableGroups.Response, GoalGetAssignableGroups.Request>(
      GoalGetAssignableGroups.pattern,
      { data: { userId: uid } },
    );

    return data;
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
      items: data.items,
      meta: data.meta,
    };
  }
}
