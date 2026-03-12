import { ExceptionTaskCreationFailed } from '@/modules/tasks/application/exceptions';
import { Task, TaskFactory, TaskRecurrence } from '@/modules/tasks/domain';
import { TaskWithRecurrenceService } from '@/modules/tasks/domain/services';
import { TasksToken } from '@/modules/tasks/tokens';
import { TimezoneVo } from '@big-d/api-utils';
import { Inject, Injectable } from '@nestjs/common';
import { GoalServiceRequestContext } from '@shared/request-context';
import { TasksWriteRepository, TaskTransaction } from '../ports';
import { TaskRecurrenceValues } from '../types';
import { GroupCheckerService } from './group-checker.service';
import { TaskCheckerService } from './task-checker.service';
import { TaskOverrideService } from './task-override.service';
import { TaskRecurrenceQueryService } from './task-recurrence-query.service';
import { TaskRecurrenceService } from './task-recurrence.service';

interface DeleteTaskInput {
  readonly taskId: number;
  readonly userId: number;
}

interface CreateTaskInput {
  readonly userId: number;
  readonly name: string;
  readonly groupId?: number;
  readonly description?: string;
  readonly priority?: number;
  readonly weight?: number;
  readonly recurrence?: TaskRecurrenceValues;
}

interface ReplaceTaskInput {
  readonly id: number;
  readonly name: string;
  readonly userId: number;
  readonly description?: string;
  readonly priority: number;
  readonly weight: number;
  readonly startDate?: string;
  readonly deadline?: string;
  readonly recurrence?: TaskRecurrenceValues;
}

interface AddTaskToGroupInput {
  readonly userId: number;
  readonly groupId: number;
  readonly taskId: number;
}

@Injectable()
class TaskService {
  private readonly taskWithRecurrenceService = new TaskWithRecurrenceService();

  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly groupCheckerService: GroupCheckerService,
    private readonly taskOverrideService: TaskOverrideService,
    private readonly taskRecurrenceService: TaskRecurrenceService,
    private readonly taskRecurrenceQueryService: TaskRecurrenceQueryService,

    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async createTask(input: CreateTaskInput, trx?: TaskTransaction): Promise<Task> {
    const draftTask = TaskFactory.create(input);
    const createdTask = await this.tasksWriteRepo.createTask(draftTask, trx);

    if (createdTask == null) {
      throw new ExceptionTaskCreationFailed({});
    }

    return createdTask;
  }

  async cloneTask(input: { taskId: number; userId: number }, trx?: TaskTransaction): Promise<Task> {
    const { taskId, userId } = input;

    const task = await this.taskCheckerService.ensureTaskExists({ taskId, userId }, { trx });
    const clonedTask = TaskFactory.clone(task);

    const createdTask = await this.tasksWriteRepo.createTask(clonedTask, trx);
    const newTask = await this.tasksWriteRepo.getTaskById({ taskId: createdTask.id, userId: createdTask.userId }, trx);

    if (newTask == null) {
      throw new ExceptionTaskCreationFailed({
        taskId: createdTask.id,
      });
    }

    return newTask;
  }

  async softDeleteTask(input: DeleteTaskInput, trx?: TaskTransaction): Promise<{ id: number }> {
    const task = await this.taskCheckerService.ensureTaskExists(
      { taskId: input.taskId, userId: input.userId },
      { trx },
    );
    const draftTask = TaskFactory.deleteSoft(task);
    await this.tasksWriteRepo.changeTaskStatus(draftTask, trx);
    await this.tasksWriteRepo.removeTaskFromGroup({ taskId: draftTask.id }, trx);
    return { id: draftTask.id };
  }

  async replaceTask(
    input: ReplaceTaskInput,
    trx?: TaskTransaction,
  ): Promise<{ task: Task; recurrence?: TaskRecurrence }> {
    const { recurrence, ...taskPatch } = input;

    const task = await this.taskCheckerService.ensureTaskExists({ taskId: input.id, userId: input.userId }, { trx });
    const currentRecurrence = await this.taskRecurrenceService.getRecurrence(
      { userId: input.userId, taskId: task.id },
      trx,
    );
    const currentOverrides =
      currentRecurrence != null && recurrence == null
        ? await this.taskOverrideService.getOverridesByRecurrenceId(
            { userId: input.userId, recurrenceId: currentRecurrence.id },
            trx,
          )
        : [];

    const timezone =
      currentRecurrence?.timezone ??
      TimezoneVo.create(GoalServiceRequestContext.getStore()?.state?.userTimezone ?? 'UTC').value;

    const replaceData = this.taskWithRecurrenceService.replace({
      task,
      taskPatch,
      currentRecurrence,
      currentOverrides,
      recurrencePatch: recurrence != null ? { ...recurrence, timezone } : undefined,
      patternShaper: (data) => this.taskRecurrenceQueryService.createRule(data).toString(),
    });

    const savedTask = await this.tasksWriteRepo.replaceTask(replaceData.task, trx);
    if (replaceData.recurrence != null) {
      await this.taskRecurrenceService.upsertRecurrence(replaceData.recurrence, trx);
    }

    if (replaceData.isCancel) {
      if (replaceData.overridesToDelete.length > 0) {
        await this.taskOverrideService.deleteOverridesByRecurrenceId(
          {
            userId: input.userId,
            recurrenceId: replaceData.recurrence.id,
            ids: replaceData.overridesToDelete.map((o) => o.id),
          },
          trx,
        );
      }

      if (replaceData.shouldDeleteRecurrence) {
        await this.taskRecurrenceService.deleteRecurrence({ id: replaceData.recurrence.id }, trx);
      }
    }

    return {
      task: savedTask,
      recurrence: replaceData.recurrence ?? undefined,
    };
  }

  async addTaskToGroup(input: AddTaskToGroupInput, trx?: TaskTransaction): Promise<void> {
    const { taskId, userId, groupId } = input;
    await this.groupCheckerService.ensureGroupExists({ groupId, userId }, { trx, includeInbox: true });
    await this.tasksWriteRepo.addTaskToGroup({ taskId, groupId }, trx);
  }
}

export { TaskService, CreateTaskInput, ReplaceTaskInput, DeleteTaskInput, AddTaskToGroupInput };
