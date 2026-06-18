import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GoalGetGroupInBox } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GetPlannerInit } from './schemas/init-planner';

@Resolver()
class PlannerPreflightResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Query(() => GetPlannerInit)
  async getPlannerInit(@TokenPayload() { uid }: AccessTokenPayload): Promise<GetPlannerInit> {
    const { data } = await this.goalClient.send<GoalGetGroupInBox.Response, GoalGetGroupInBox.Request>(
      GoalGetGroupInBox.pattern,
      { data: { userId: uid } },
    );

    return {
      inboxId: data.id,
      inboxTaskCount: data.taskCount,
    };
  }
}

export { PlannerPreflightResolver };
