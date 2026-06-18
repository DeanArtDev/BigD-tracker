import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GoalGetGroupInBox, GoalGetTasks } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GetInboxResponse, GetInboxTasksInput, InboxTasksStatuses, TasksConnection } from '../schemas';

@Resolver(() => GetInboxResponse)
export class GroupsResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Query(() => GetInboxResponse)
  async getInbox(@TokenPayload() { uid }: AccessTokenPayload) {
    const { data } = await this.goalClient.send<GoalGetGroupInBox.Response, GoalGetGroupInBox.Request>(
      GoalGetGroupInBox.pattern,
      { data: { userId: uid } },
    );

    return data;
  }

  @ResolveField(() => TasksConnection)
  async tasks(
    @TokenPayload() { uid }: AccessTokenPayload,
    @Parent() inboxResponse: GetInboxResponse,
    @Args('input', { nullable: true }) input?: GetInboxTasksInput,
  ): Promise<TasksConnection> {
    const { status, limit = 10000, cursor, search, priority } = input ?? {};

    const s = status?.filter((i) => InboxTasksStatuses.includes(i)) ?? InboxTasksStatuses;

    const { data } = await this.goalClient.send<GoalGetTasks.Response, GoalGetTasks.Request>(GoalGetTasks.pattern, {
      data: {
        userId: uid,
        search,
        filter: {
          groupIds: [inboxResponse.id],
          limit,
          cursor,
          status: s,
          priority,
        },
      },
    });
    return {
      items: data.items,
      meta: data.meta,
    };
  }
}
