import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { TaskSchema } from '@/modules/goal-service/tasks';
import { GoalAssignTaskToGroup, GoalCreateTask, GoalDeleteTask, GoalUnassignTaskFromGroup } from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TaskAssignInput, TaskCreateInput, TaskDeleteInput, TaskUnassignInput } from './schemas';

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

  @Mutation(() => TaskSchema, {
    description: 'Выход пользователя из системы на одном устройстве',
  })
  async deleteTask(
    @Args('input') input: TaskDeleteInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GoalDeleteTask.Response['data']> {
    const { data } = await this.goalClient.send<GoalDeleteTask.Response, GoalDeleteTask.Request>(
      GoalDeleteTask.pattern,
      {
        data: {
          userId: uid,
          taskId: input.id,
        },
      },
    );

    return data;
  }

  @Mutation(() => Boolean, {
    description: 'Добавить дело в группу',
  })
  async assignTaskToGroup(
    @Args('input') input: TaskAssignInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<boolean> {
    const { data } = await this.goalClient.send<GoalAssignTaskToGroup.Response, GoalAssignTaskToGroup.Request>(
      GoalAssignTaskToGroup.pattern,
      {
        data: {
          userId: uid,
          groupId: input.groupId,
          taskId: input.taskId,
        },
      },
    );

    return data.success;
  }

  @Mutation(() => Boolean, {
    description: 'Удалить дело из группы',
  })
  async unassignTaskToGroup(
    @Args('input') input: TaskUnassignInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<boolean> {
    const { data } = await this.goalClient.send<GoalUnassignTaskFromGroup.Response, GoalUnassignTaskFromGroup.Request>(
      GoalUnassignTaskFromGroup.pattern,
      {
        data: {
          userId: uid,
          groupId: input.groupId,
          taskId: input.taskId,
        },
      },
    );

    return data.success;
  }
}

export { TasksResolver };
