import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GoalGetAssignableGroups } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GroupInfoDto, GroupSchema } from '../schemas';

@Resolver(() => GroupSchema)
export class GroupsResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Query(() => [GroupInfoDto])
  async getAssignableGroups(@TokenPayload() { uid }: AccessTokenPayload): Promise<GroupInfoDto[]> {
    const { data } = await this.goalClient.send<GoalGetAssignableGroups.Response, GoalGetAssignableGroups.Request>(
      GoalGetAssignableGroups.pattern,
      { data: { userId: uid } },
    );

    return data;
  }
}
