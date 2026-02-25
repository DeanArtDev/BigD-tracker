import {
  GetAssignableTasksQuery,
  GetTasksHandler,
  GetTasksQuery,
} from '@/modules/tasks/application/queries';
import {
  AssignTaskToGroupCommand,
  CloneTaskCommand,
  CompleteDeleteTaskCommand,
  CreateTaskCommand,
  FinishTaskCommand,
  ReplaceTaskCommand,
  SoftDeleteTaskCommand,
  UnassignTaskFromGroupCommand,
  UpdateInboxTaskCommand,
} from '@/modules/tasks/application/use-cases';
import {
  GoalAssignTaskToGroup,
  GoalCloneTask,
  GoalCompleteDeleteTask,
  GoalCreateTask,
  GoalDeleteTask,
  GoalFinishTask,
  GoalGetAssignableTasks,
  GoalGetTasks,
  GoalReplaceTask,
  GoalUnassignTaskFromGroup,
  GoalUpdateInboxTask,
} from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class TasksRmqController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(GoalCreateTask.pattern)
  async createTask(
    @Payload() { data: payload }: GoalCreateTask.Request,
  ): Promise<GoalCreateTask.Response> {
    return {
      data: await this.commandBus.execute(
        new CreateTaskCommand({
          userId: payload.userId,
          groupId: payload.groupId,
          priority: payload.priority,
          deadline: payload.deadline,
          name: payload.name,
          description: payload.description,
          recurrence: payload.recurrence,
          weight: payload.weight,
          startDate: payload.startDate,
        }),
      ),
    };
  }

  @MessagePattern(GoalCloneTask.pattern)
  async cloneTask(
    @Payload() { data: payload }: GoalCloneTask.Request,
  ): Promise<GoalCloneTask.Response> {
    return {
      data: await this.commandBus.execute(
        new CloneTaskCommand({
          userId: payload.userId,
          taskId: payload.taskId,
          groupId: payload.groupId,
        }),
      ),
    };
  }

  @MessagePattern(GoalReplaceTask.pattern)
  async replaceTask(
    @Payload() { data: payload }: GoalReplaceTask.Request,
  ): Promise<GoalReplaceTask.Response> {
    return {
      data: await this.commandBus.execute(
        new ReplaceTaskCommand({
          deadline: payload.deadline,
          name: payload.name,
          id: payload.id,
          userId: payload.userId,
          weight: payload.weight,
          startDate: payload.startDate,
          description: payload.description,
          recurrence: payload.recurrence,
          priority: payload.priority,
        }),
      ),
    };
  }

  @MessagePattern(GoalUpdateInboxTask.pattern)
  async updateInboxTask(
    @Payload() { data: payload }: GoalUpdateInboxTask.Request,
  ): Promise<GoalUpdateInboxTask.Response> {
    return {
      data: await this.commandBus.execute(
        new UpdateInboxTaskCommand({
          id: payload.id,
          userId: payload.userId,
          name: payload.name,
          deadline: payload.deadline,
          description: payload.description,
          priority: payload.priority,
        }),
      ),
    };
  }

  @MessagePattern(GoalDeleteTask.pattern)
  async deleteTask(
    @Payload() { data: payload }: GoalDeleteTask.Request,
  ): Promise<GoalDeleteTask.Response> {
    return {
      data: await this.commandBus.execute(
        new SoftDeleteTaskCommand({ taskId: payload.id, userId: payload.userId }),
      ),
    };
  }

  @MessagePattern(GoalCompleteDeleteTask.pattern)
  async completeDeleteTask(
    @Payload() { data: payload }: GoalCompleteDeleteTask.Request,
  ): Promise<GoalCompleteDeleteTask.Response> {
    return {
      data: await this.commandBus.execute(
        new CompleteDeleteTaskCommand({ taskId: payload.taskId, userId: payload.userId }),
      ),
    };
  }

  @MessagePattern(GoalAssignTaskToGroup.pattern)
  async assignTaskToGroup(
    @Payload() { data: payload }: GoalAssignTaskToGroup.Request,
  ): Promise<GoalAssignTaskToGroup.Response> {
    return {
      data: await this.commandBus.execute(
        new AssignTaskToGroupCommand({
          taskId: payload.taskId,
          userId: payload.userId,
          groupId: payload.groupId,
        }),
      ),
    };
  }

  @MessagePattern(GoalUnassignTaskFromGroup.pattern)
  async unassignTaskFromGroup(
    @Payload() { data: payload }: GoalUnassignTaskFromGroup.Request,
  ): Promise<GoalUnassignTaskFromGroup.Response> {
    return {
      data: await this.commandBus.execute(
        new UnassignTaskFromGroupCommand({
          taskId: payload.taskId,
          userId: payload.userId,
          groupId: payload.groupId,
        }),
      ),
    };
  }

  @MessagePattern(GoalGetTasks.pattern)
  async getDiaryTasks(
    @Payload() { data: payload }: GoalGetTasks.Request,
  ): Promise<GoalGetTasks.Response> {
    const { userId, search, filter, sort, page, perPage } = payload;

    const tasks = await this.queryBus.execute<
      GetTasksQuery,
      ReturnHandlerType<typeof GetTasksHandler>
    >(
      new GetTasksQuery({
        userId,
        meta: { search, filter, sort, page, perPage },
      }),
    );

    return {
      data: {
        items: tasks,
        meta: { nextPage: perPage <= tasks.length },
      },
    };
  }

  @MessagePattern(GoalGetAssignableTasks.pattern)
  async getAssignableTasks(
    @Payload() { data: payload }: GoalGetAssignableTasks.Request,
  ): Promise<GoalGetAssignableTasks.Response> {
    return {
      data: await this.queryBus.execute(
        new GetAssignableTasksQuery({
          userId: payload.userId,
          search: payload.search,
        }),
      ),
    };
  }

  @MessagePattern(GoalFinishTask.pattern)
  async finishTask(
    @Payload() { data: payload }: GoalFinishTask.Request,
  ): Promise<GoalFinishTask.Response> {
    await this.commandBus.execute(
      new FinishTaskCommand({
        userId: payload.userId,
        taskId: payload.taskId,
      }),
    );
    return { data: true };
  }
}
