import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GoalCreateGroup, GoalReplaceGroup } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GroupCreateInput, GroupSchema, GroupUpdateInput } from '../schemas';

@Resolver(() => GroupSchema)
class GroupsMutationsResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Mutation(() => GroupSchema, {
    description: 'Создание группы',
  })
  async createGroup(
    @Args('input') input: GroupCreateInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GroupSchema> {
    const { data } = await this.goalClient.send<GoalCreateGroup.Response, GoalCreateGroup.Request>(
      GoalCreateGroup.pattern,
      {
        data: {
          userId: uid,
          name: input.name,
          description: input.description,
        },
      },
    );

    return data;
  }

  @Mutation(() => GroupSchema, {
    description: 'Редактирование группы',
  })
  async updateGroup(
    @Args('input') input: GroupUpdateInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GoalReplaceGroup.Response['data']> {
    const { data } = await this.goalClient.send<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(
      GoalReplaceGroup.pattern,
      {
        data: {
          id: input.id,
          userId: uid,
          name: input.name,
          description: input.description,
          tasks: input.tasks,
        },
      },
    );

    return data;
  }
}

export { GroupsMutationsResolver };
