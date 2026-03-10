import { ExceptionTaskCreationFailed } from '@/modules/tasks/application/exceptions';
import { Task, TaskFactory, TaskRecurrence } from '@/modules/tasks/domain';
import { TaskWithRecurrenceService } from '@/modules/tasks/domain/services';
import { TasksToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { timeAndDate } from '@shared/date-and-time';
import { GoalServiceRequestContext } from '@shared/request-context';
import { TasksWriteRepository, TaskTransaction } from '../ports';
import { TaskRecurrenceValues } from '../types';
import { GroupCheckerService } from './group-checker.service';
import { TaskCheckerService } from './task-checker.service';
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
    const now = new Date().toISOString();

    const task = await this.taskCheckerService.ensureTaskExists({ taskId: input.id, userId: input.userId }, { trx });
    const currentRecurrence = await this.taskRecurrenceService.getRecurrence(
      { userId: input.userId, taskId: task.id },
      trx,
    );

    const recurrencePatch =
      recurrence != null ? this.buildRecurrencePatch({ recurrence, currentRecurrence }) : undefined;
    const cancelPattern =
      recurrence == null && currentRecurrence != null
        ? this.buildCancelPattern({
            recurrence: currentRecurrence,
            now,
          })
        : undefined;

    const next = this.taskWithRecurrenceService.replace({
      task,
      taskPatch,
      currentRecurrence,
      recurrencePatch,
      cancelDate: taskPatch.startDate,
      cancelPattern,
      now,
    });

    const savedTask = await this.tasksWriteRepo.replaceTask(next.task, trx);
    if (next.recurrence != null) {
      await this.taskRecurrenceService.upsertRecurrence(next.recurrence, trx);
    } else if (next.isCancel && currentRecurrence != null) {
      await this.taskRecurrenceService.deleteRecurrence({ id: currentRecurrence.id }, trx);
    }

    return {
      task: savedTask,
      recurrence: next.recurrence ?? undefined,
    };
  }

  async addTaskToGroup(input: AddTaskToGroupInput, trx?: TaskTransaction): Promise<void> {
    const { taskId, userId, groupId } = input;
    await this.groupCheckerService.ensureGroupExists({ groupId, userId }, { trx, includeInbox: true });
    await this.tasksWriteRepo.addTaskToGroup({ taskId, groupId }, trx);
  }

  private buildRecurrencePatch(input: {
    recurrence: TaskRecurrenceValues;
    currentRecurrence: TaskRecurrence | null;
  }): TaskRecurrenceValues & { timezone: string; pattern: string } {
    const { recurrence, currentRecurrence } = input;
    const timezone = currentRecurrence?.timezone ?? GoalServiceRequestContext.getStore()?.state?.userTimezone ?? 'UTC';
    const recurrencePatch = {
      timezone,
      startDate: recurrence.startDate,
      untilDate: recurrence.untilDate,
      frequency: recurrence.frequency,
      interval: recurrence.interval,
      monthdays: recurrence.monthdays,
      yearmonths: recurrence.yearmonths,
      weekdays: recurrence.weekdays,
      weekstart: recurrence.weekstart,
    };

    return {
      ...recurrencePatch,
      pattern: this.taskRecurrenceQueryService.createRule(recurrencePatch).toString(),
    };
  }

  private buildCancelPattern(input: { recurrence: TaskRecurrence; now: string }): string {
    const { recurrence, now } = input;
    const untilDate = timeAndDate(now).tz(recurrence.timezone).startOf('day').utc().toISOString();

    return this.taskRecurrenceQueryService
      .createRule({
        timezone: recurrence.timezone,
        startDate: recurrence.startDate,
        untilDate,
        frequency: recurrence.frequency.value,
        interval: recurrence.interval,
        monthdays: recurrence.monthdays,
        yearmonths: recurrence.yearmonths,
        weekdays: recurrence.weekdays,
        weekstart: recurrence.weekstart,
      })
      .toString();
  }
}

export { TaskService, CreateTaskInput, ReplaceTaskInput, DeleteTaskInput, AddTaskToGroupInput };
