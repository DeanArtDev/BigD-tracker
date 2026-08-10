import { Task, TaskFactory, TaskRecurrence } from '@/modules/tasks/domain';
import { TaskWithRecurrenceService } from '@/modules/tasks/domain/services';
import { TasksToken } from '@/modules/tasks/tokens';
import { TimezoneVo } from '@big-d/api-utils';
import { Inject, Injectable } from '@nestjs/common';
import { GoalServiceRequestContext } from '@shared/request-context';
import { TasksWriteRepository, TaskTransaction } from '../ports';
import { TaskRecurrenceValues } from '../types';
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
  readonly recurrence?: TaskRecurrenceValues;
}

interface ReplaceTaskInput {
  readonly id: number;
  readonly groupId?: number;
  readonly name: string;
  readonly userId: number;
  readonly description?: string;
  readonly priority: number;
  readonly startDate?: string;
  readonly deadline?: string;
  readonly recurrence?: TaskRecurrenceValues;
}

@Injectable()
class TaskService {
  private readonly taskWithRecurrenceService = new TaskWithRecurrenceService();

  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly taskOverrideService: TaskOverrideService,
    private readonly taskRecurrenceService: TaskRecurrenceService,
    private readonly taskRecurrenceQueryService: TaskRecurrenceQueryService,

    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async createTask(input: CreateTaskInput, trx?: TaskTransaction): Promise<Task> {
    const draftTask = TaskFactory.create(input);
    return await this.tasksWriteRepo.createTask(draftTask, trx);
  }

  async cloneTask(input: { taskId: number; userId: number }, trx?: TaskTransaction): Promise<Task> {
    const { taskId, userId } = input;

    const task = await this.taskCheckerService.ensureTaskExists({ taskId, userId }, { trx });
    return await this.tasksWriteRepo.createTask(TaskFactory.clone(task), trx);
  }

  async softDeleteTask(input: DeleteTaskInput, trx?: TaskTransaction): Promise<Task> {
    const task = await this.taskCheckerService.ensureTaskExists(
      { taskId: input.taskId, userId: input.userId },
      { trx },
    );
    const { taskToDelete } = this.taskWithRecurrenceService.softDelete({ task });
    return await this.tasksWriteRepo.replaceTask(taskToDelete, trx);
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
      currentRecurrence != null
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

    if (replaceData.isRecurrenceUpdate) {
      await this.taskRecurrenceService.updateRecurrence(replaceData.recurrence, trx);

      if (replaceData.overridesToUpdate.length > 0) {
        for (const override of replaceData.overridesToUpdate) {
          await this.taskOverrideService.updateOverride(override, trx);
        }
      }
    }

    if (replaceData.isRecurrenceCancel) {
      if (replaceData.recurrence != null) {
        await this.taskRecurrenceService.updateRecurrence(replaceData.recurrence, trx);
      }

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

      return {
        task: savedTask,
        recurrence: undefined,
      };
    }

    if (replaceData.isRecurrenceCreate) {
      if (replaceData.overridesToUpdate.length > 0) {
        for (const override of replaceData.overridesToUpdate) {
          await this.taskOverrideService.updateOverride(override, trx);
        }
      }

      if (currentRecurrence == null) {
        await this.taskRecurrenceService.upsertRecurrence(replaceData.recurrence, trx);
      } else {
        await this.taskRecurrenceService.updateRecurrence(replaceData.recurrence, trx);
      }
    }

    return {
      task: savedTask,
      recurrence: replaceData.recurrence ?? undefined,
    };
  }
}

export { TaskService, CreateTaskInput, ReplaceTaskInput, DeleteTaskInput };
