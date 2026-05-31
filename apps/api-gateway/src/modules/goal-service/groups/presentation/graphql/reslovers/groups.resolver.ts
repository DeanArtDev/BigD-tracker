import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GoalGetGroupInBox } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GetInboxResponse } from './schemas/get-inbox.schema';

@Resolver()
export class GroupsResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Query(() => GetInboxResponse)
  async getInbox(@TokenPayload() { uid }: AccessTokenPayload): Promise<GoalGetGroupInBox.Response['data']> {
    const { data } = await this.goalClient.send<GoalGetGroupInBox.Response, GoalGetGroupInBox.Request>(
      GoalGetGroupInBox.pattern,
      { data: { userId: uid } },
    );

    return data;
  }
}
