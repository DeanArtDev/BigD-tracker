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
  GoalUpdateTaskSettings,
} from '@big-d/api-contracts';
import { Inject } from '@nestjs/common';
import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { TaskMapper } from '../mappers/task.mapper';
import {
  TaskAssignInput,
  TaskCompleteDeleteInput,
  TaskCloneInput,
  TaskCreateInput,
  TaskDeleteInput,
  TaskFinishInput,
  TaskRecoveryInput,
  TaskSettingsSchema,
  TaskSettingsUpdateInput,
  TaskUnassignInput,
  TaskUpdateInput,
} from './schemas';

@Resolver(() => TaskSchema)
class TasksMutationsResolver {
  constructor(@Inject(GOAL_RMQ_SERVICE) private readonly goalClient: AppRmqClient) {}

  @Mutation(() => TaskSchema, {
    description: 'Создание дела',
  })
  async createTask(
    @Args('input') input: TaskCreateInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TaskSchema> {
    const { data } = await this.goalClient.send<GoalCreateTask.Response, GoalCreateTask.Request>(
      GoalCreateTask.pattern,
      {
        data: {
          userId: uid,
          groupId: input.groupId,
          priority: TaskMapper.fromClientPriorityToServer(input.priority),
          description: input.description,
          name: input.name,
          startDate: input.startDate,
          deadline: input.deadline,
        },
      },
    );

    return TaskMapper.fromServerTaskDtoToClientDto(data);
  }

  @Mutation(() => TaskSchema, {
    description: 'Редактирование дела',
  })
  async updateTask(
    @Args('input') input: TaskUpdateInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TaskSchema> {
    const { data } = await this.goalClient.send<GoalReplaceTask.Response, GoalReplaceTask.Request>(
      GoalReplaceTask.pattern,
      {
        data: {
          id: input.id,
          userId: uid,
          priority: TaskMapper.fromClientPriorityToServer(input.priority),
          name: input.name,
          description: input.description,
          startDate: input.startDate,
          deadline: input.deadline,
          recurrence: input.recurrence,
        },
      },
    );

    return TaskMapper.fromServerTaskDtoToClientDto(data);
  }

  @Mutation(() => TaskSettingsSchema, {
    description: 'Редактирование настроек дела',
  })
  async updateTaskSettings(
    @Args('input') input: TaskSettingsUpdateInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TaskSettingsSchema> {
    const { data } = await this.goalClient.send<GoalUpdateTaskSettings.Response, GoalUpdateTaskSettings.Request>(
      GoalUpdateTaskSettings.pattern,
      {
        data: {
          userId: uid,
          taskId: input.taskId,
          icon: input.icon,
          isAllDay: input.isAllDay,
        },
      },
    );

    return data;
  }

  @Mutation(() => TaskSchema, {
    description: 'Удаление дела',
  })
  async deleteTask(
    @Args('input') input: TaskDeleteInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TaskSchema> {
    const { data } = await this.goalClient.send<GoalDeleteTask.Response, GoalDeleteTask.Request>(
      GoalDeleteTask.pattern,
      {
        data: {
          userId: uid,
          taskId: input.id,
        },
      },
    );

    return TaskMapper.fromServerTaskDtoToClientDto(data);
  }

  @Mutation(() => TaskSchema, {
    description: 'Клонирование дела',
  })
  async cloneTask(
    @Args('input') input: TaskCloneInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TaskSchema> {
    const { data } = await this.goalClient.send<GoalCloneTask.Response, GoalCloneTask.Request>(GoalCloneTask.pattern, {
      data: {
        userId: uid,
        taskId: input.id,
      },
    });

    return TaskMapper.fromServerTaskDtoToClientDto(data);
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

  @Mutation(() => TaskSchema, {
    description: 'Завершение дела',
  })
  async finishTask(
    @Args('input') input: TaskFinishInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TaskSchema> {
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

    return TaskMapper.fromServerTaskDtoToClientDto(data);
  }

  @Mutation(() => TaskSchema, {
    description: 'Восстановление дела',
  })
  async taskRecovery(
    @Args('input') input: TaskRecoveryInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TaskSchema> {
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

    return TaskMapper.fromServerTaskDtoToClientDto(data);
  }

  @Mutation(() => TaskSchema, {
    description: 'Добавить дело в группу',
  })
  async assignTaskToGroup(
    @Args('input') input: TaskAssignInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TaskSchema> {
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

    return TaskMapper.fromServerTaskDtoToClientDto(data);
  }

  @Mutation(() => TaskSchema, {
    description: 'Удалить дело из группы',
  })
  async unassignTaskToGroup(
    @Args('input') input: TaskUnassignInput,
    @TokenPayload() { uid }: AccessTokenPayload,
  ): Promise<TaskSchema> {
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

    return TaskMapper.fromServerTaskDtoToClientDto(data);
  }
}

export { TasksMutationsResolver };
