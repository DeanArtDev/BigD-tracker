import { AppRmqClient, GOAL_RMQ_SERVICE } from '@/infrastructure/rmq-clients';
import { TokenPayload } from '@/modules/auth/decorators';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { TaskSchema } from '@/modules/goal-service/tasks';
import {
  GoalAssignTaskToGroup,
  GoalCloneTask,
  GoalCompleteDeleteTask,
  GoalCreateTask,
  GoalDeleteTask,
  GoalFinishTask,
  GoalReplaceTask,
  GoalTaskRecovery,
  GoalUnassignTaskFromGroup,
} from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import {
  TaskAssignInput,
  TaskCompleteDeleteInput,
  TaskCopyInput,
  TaskCreateInput,
  TaskDeleteInput,
  TaskFinishInput,
  TaskRecoveryInput,
  TaskUpdateInput,
  TaskUnassignInput,
} from './schemas';

@Resolver(() => TaskSchema)
class TasksMutationsResolver {
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
    description: 'Редактирование дела',
  })
  async updateTask(
    @Args('input') input: TaskUpdateInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GoalReplaceTask.Response['data']> {
    const { data } = await this.goalClient.send<GoalReplaceTask.Response, GoalReplaceTask.Request>(
      GoalReplaceTask.pattern,
      {
        data: {
          id: input.id,
          userId: uid,
          priority: input.priority,
          name: input.name,
          description: input.description,
          weight: input.weight,
          startDate: input.startDate,
          deadline: input.deadline,
          recurrence: input.recurrence,
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

  @Mutation(() => TaskSchema, {
    description: 'Копирование дела',
  })
  async copyTask(
    @Args('input') input: TaskCopyInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GoalCloneTask.Response['data']> {
    const { data } = await this.goalClient.send<GoalCloneTask.Response, GoalCloneTask.Request>(GoalCloneTask.pattern, {
      data: {
        userId: uid,
        taskId: input.id,
      },
    });

    return data;
  }

  @Mutation(() => Int, {
    description: 'Полное удаление дела',
  })
  async completeDeleteTask(
    @Args('input') input: TaskCompleteDeleteInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GoalCompleteDeleteTask.Response['data']['id']> {
    const { data } = await this.goalClient.send<GoalCompleteDeleteTask.Response, GoalCompleteDeleteTask.Request>(
      GoalCompleteDeleteTask.pattern,
      {
        data: {
          userId: uid,
          taskId: input.id,
        },
      },
    );

    return data.id;
  }

  @Mutation(() => Boolean, {
    description: 'Завершение дела',
  })
  async finishTask(
    @Args('input') input: TaskFinishInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GoalFinishTask.Response['data']> {
    const { data } = await this.goalClient.send<GoalFinishTask.Response, GoalFinishTask.Request>(
      GoalFinishTask.pattern,
      {
        data: {
          userId: uid,
          taskId: input.id,
          reason: input.reason,
          type: input.type,
        },
      },
    );

    return data;
  }

  @Mutation(() => Int, {
    description: 'Восстановление дела',
  })
  async taskRecovery(
    @Args('input') input: TaskRecoveryInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<GoalTaskRecovery.Response['data']['id']> {
    const { data } = await this.goalClient.send<GoalTaskRecovery.Response, GoalTaskRecovery.Request>(
      GoalTaskRecovery.pattern,
      {
        data: {
          userId: uid,
          taskId: input.id,
          groupId: input.groupId,
        },
      },
    );

    return data.id;
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

export { TasksMutationsResolver };
