import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { TaskSchema } from '@/modules/goal-service/tasks';
import { GoalGetGroupInBox, GoalGetTasks } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Query, Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { GetInboxResponse } from '../schemas';

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

  @ResolveField(() => [TaskSchema], { nullable: 'items' })
  async tasks(@TokenPayload() { uid }: AccessTokenPayload, @Parent() inboxResponse: GetInboxResponse) {
    const { data } = await this.goalClient.send<GoalGetTasks.Response, GoalGetTasks.Request>(GoalGetTasks.pattern, {
      data: { userId: uid, groupIds: [inboxResponse.id] },
    });
    return data.items;
  }
}
