import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { TaskSchema } from '@/modules/goal-service/tasks';
import { GoalCreateTask } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TaskCreateInput } from './schemas';

@Resolver(() => TaskSchema)
class TasksResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Mutation(() => TaskSchema, {
    description: 'Выход пользователя из системы на одном устройстве',
  })
  async createTask(
    @Args('input') input: TaskCreateInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GoalCreateTask.Response['data']> {
    const { data } = await this.goalClient.send<GoalCreateTask.Response, GoalCreateTask.Request>(
      GoalCreateTask.pattern,
      {
        data: {
          userId: uid,
          groupId: input.groupId,
          priority: input.priority,
          description: input.description,
          name: input.name,
          startDate: input.startDate,
          deadline: input.deadline,
        },
      },
    );

    return data;
  }
}

export { TasksResolver };
