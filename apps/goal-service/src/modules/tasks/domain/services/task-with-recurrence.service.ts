import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { TaskRecurrenceStatus, TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { timeAndDate } from '@shared/date-and-time';
import { Task, TaskFactory, TaskFactoryReplaceInput, TaskOverride, TaskRecurrence } from '../aggregates/task';

interface TaskWithRecurrenceInput {
  readonly startDate: string;
  readonly pattern: string;
  readonly timezone: string;
  readonly frequency: TaskRecurrence['frequency']['value'];
  readonly weekstart?: TaskRecurrence['weekstart'];
  readonly untilDate?: string;
  readonly interval?: number;
  readonly weekdays?: TaskRecurrence['weekdays'];
  readonly monthdays?: TaskRecurrence['monthdays'];
  readonly yearmonths?: TaskRecurrence['yearmonths'];
}

interface TaskWithRecurrenceCreateInput {
  readonly task: Task;
  readonly taskPatch: TaskFactoryReplaceInput;
  readonly recurrence: TaskWithRecurrenceInput;
}

interface TaskWithRecurrenceUpdateInput {
  readonly task: Task;
  readonly taskPatch: TaskFactoryReplaceInput;
  readonly recurrencePatch: TaskWithRecurrenceInput;
  readonly currentRecurrence?: TaskRecurrence | null;
}

interface TaskWithRecurrenceCancelInput {
  readonly task: Task;
  readonly taskPatch: TaskFactoryReplaceInput;
  readonly currentRecurrence: TaskRecurrence;
  readonly cancelDate?: string;
  readonly pattern: string;
  readonly now?: string;
}

interface TaskWithRecurrenceReplaceInput {
  readonly task: Task;
  readonly taskPatch: TaskFactoryReplaceInput;
  readonly currentRecurrence: TaskRecurrence | null | undefined;
  readonly currentOverrides?: TaskOverride[];
  readonly recurrencePatch: Omit<TaskWithRecurrenceInput, 'pattern'> | undefined;
  readonly now: string;
  readonly patternShaper: (data: Omit<TaskWithRecurrenceInput, 'pattern'>) => string;
}

type TaskWithRecurrenceCreateResult = {
  readonly task: Task;
  readonly recurrence: TaskRecurrence;
  readonly isCreate: true;
  readonly isUpdate?: never;
  readonly isCancel?: never;
  readonly shouldDeleteRecurrence: false;
  readonly shouldDeleteOverrides: false;
};

type TaskWithRecurrenceUpdateResult = {
  readonly task: Task;
  readonly recurrence: TaskRecurrence;
  readonly isUpdate: true;
  readonly isCreate?: never;
  readonly isCancel?: never;
  readonly shouldDeleteRecurrence: false;
  readonly shouldDeleteOverrides: false;
};

type TaskWithRecurrenceCancelDeleteResult = {
  readonly task: Task;
  readonly recurrence: null;
  readonly isCancel: true;
  readonly isCreate?: never;
  readonly isUpdate?: never;
  readonly shouldDeleteRecurrence: true;
  readonly shouldDeleteOverrides: true;
};

type TaskWithRecurrenceCancelKeepResult = {
  readonly task: Task;
  readonly recurrence: TaskRecurrence | null;
  readonly isCancel: true;
  readonly isCreate?: never;
  readonly isUpdate?: never;
  readonly shouldDeleteRecurrence: false;
  readonly shouldDeleteOverrides: false;
};

type TaskWithRecurrenceNoopResult = {
  readonly task: Task;
  readonly recurrence: null;
  readonly isCreate?: never;
  readonly isUpdate?: never;
  readonly isCancel?: never;
  readonly shouldDeleteRecurrence: false;
  readonly shouldDeleteOverrides: false;
};

type TaskWithRecurrenceReplaceResult =
  | TaskWithRecurrenceCreateResult
  | TaskWithRecurrenceUpdateResult
  | TaskWithRecurrenceCancelDeleteResult
  | TaskWithRecurrenceCancelKeepResult
  | TaskWithRecurrenceNoopResult;

class TaskWithRecurrenceService {
  ensureNotRepeatable(input: { type: 'virtual' | 'override'; recurrence?: unknown; taskId?: string | number }): void {
    if (input.recurrence == null) {
      return;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: `${input.type} task cannot have recurrence`,
      field: 'recurrence',
      taskId: typeof input.taskId === 'number' ? input.taskId : undefined,
    });
  }

  replace(input: TaskWithRecurrenceReplaceInput): TaskWithRecurrenceReplaceResult {
    const { task, taskPatch, currentRecurrence, currentOverrides = [], recurrencePatch, now, patternShaper } = input;

    this.assertOverridesBelongToRecurrence({
      taskId: task.id,
      currentRecurrence,
      currentOverrides,
    });

    const isCreate = (currentRecurrence == null || currentRecurrence.isCanceled) && recurrencePatch != null;
    const isUpdate = currentRecurrence != null && recurrencePatch != null;
    const isCancel = currentRecurrence != null && recurrencePatch == null;

    if (isCreate) {
      const pattern = patternShaper(recurrencePatch);
      const next = this.create({
        task,
        taskPatch,
        recurrence: { ...recurrencePatch, pattern },
      });

      return {
        ...next,
        isCreate: true,
        shouldDeleteRecurrence: false,
        shouldDeleteOverrides: false,
      };
    }

    if (isUpdate) {
      const pattern = patternShaper(recurrencePatch);
      const next = this.update({
        task,
        taskPatch,
        currentRecurrence,
        recurrencePatch: { ...recurrencePatch, pattern },
      });

      return {
        ...next,
        isUpdate: true,
        shouldDeleteRecurrence: false,
        shouldDeleteOverrides: false,
      };
    }

    if (isCancel) {
      if (this.canDeleteRecurrence(currentOverrides)) {
        return {
          task: TaskFactory.replace(task, taskPatch),
          recurrence: null,
          isCancel: true,
          shouldDeleteRecurrence: true,
          shouldDeleteOverrides: true,
        };
      }

      const untilDate = timeAndDate(now).tz(currentRecurrence.timezone).startOf('day').utc().toISOString();

      const cancelPattern = patternShaper({
        frequency: currentRecurrence.frequency.value,
        weekstart: currentRecurrence.weekstart,
        untilDate,
        interval: currentRecurrence.interval,
        weekdays: currentRecurrence.weekdays,
        monthdays: currentRecurrence.monthdays,
        yearmonths: currentRecurrence.yearmonths,
        startDate: taskPatch.startDate ?? task.startDate ?? now,
        timezone: currentRecurrence.timezone,
      });

      const next = this.cancel({
        task,
        taskPatch,
        currentRecurrence,
        cancelDate: taskPatch.startDate,
        pattern: cancelPattern,
        now,
      });

      return {
        ...next,
        isCancel: true,
        shouldDeleteRecurrence: false,
        shouldDeleteOverrides: false,
      };
    }

    return {
      task: TaskFactory.replace(task, taskPatch),
      recurrence: null,
      shouldDeleteRecurrence: false,
      shouldDeleteOverrides: false,
    };
  }

  create(input: TaskWithRecurrenceCreateInput): { task: Task; recurrence: TaskRecurrence } {
    const { task, taskPatch, recurrence } = input;

    const updatedTask = TaskFactory.replace(task, taskPatch);

    this.assertTaskPersisted(updatedTask);
    this.assertRecurrenceInvariants({
      taskId: updatedTask.id,
      taskStartDate: taskPatch.startDate,
      recurrenceStartDate: recurrence.startDate,
      timezone: recurrence.timezone,
    });

    return {
      task: updatedTask,
      recurrence: TaskRecurrence.create({
        userId: updatedTask.userId,
        taskId: updatedTask.id,
        status: TaskRecurrenceStatus.ACTIVE,
        pattern: recurrence.pattern,
        timezone: recurrence.timezone,
        startDate: DateVo.create(recurrence.startDate),
        frequency: recurrence.frequency,
        weekstart: recurrence.weekstart ?? 0,
        untilDate: recurrence.untilDate != null ? DateVo.create(recurrence.untilDate) : undefined,
        interval: recurrence.interval,
        weekdays: recurrence.weekdays,
        monthdays: recurrence.monthdays,
        yearmonths: recurrence.yearmonths,
      }),
    };
  }

  update(input: TaskWithRecurrenceUpdateInput): { task: Task; recurrence: TaskRecurrence } {
    const { task, taskPatch, recurrencePatch, currentRecurrence } = input;
    const updatedTask = TaskFactory.replace(task, taskPatch);
    const timezone = currentRecurrence?.timezone ?? recurrencePatch.timezone;

    this.assertRecurrenceInvariants({
      taskId: updatedTask.id,
      taskStartDate: updatedTask.startDate,
      recurrenceStartDate: recurrencePatch.startDate,
      timezone,
    });

    return {
      task: updatedTask,
      recurrence:
        currentRecurrence == null
          ? TaskRecurrence.create({
              userId: updatedTask.userId,
              taskId: updatedTask.id,
              status: TaskRecurrenceStatus.ACTIVE,
              pattern: recurrencePatch.pattern,
              timezone,
              startDate: DateVo.create(recurrencePatch.startDate),
              frequency: recurrencePatch.frequency,
              weekstart: recurrencePatch.weekstart ?? 0,
              untilDate: recurrencePatch.untilDate != null ? DateVo.create(recurrencePatch.untilDate) : undefined,
              interval: recurrencePatch.interval,
              weekdays: recurrencePatch.weekdays,
              monthdays: recurrencePatch.monthdays,
              yearmonths: recurrencePatch.yearmonths,
            })
          : currentRecurrence.replace({
              startDate: DateVo.create(recurrencePatch.startDate),
              pattern: recurrencePatch.pattern,
              frequency: recurrencePatch.frequency,
              weekstart: recurrencePatch.weekstart ?? 0,
              untilDate: recurrencePatch.untilDate != null ? DateVo.create(recurrencePatch.untilDate) : undefined,
              interval: recurrencePatch.interval,
              weekdays: recurrencePatch.weekdays,
              monthdays: recurrencePatch.monthdays,
              yearmonths: recurrencePatch.yearmonths,
            }),
    };
  }

  cancel(input: TaskWithRecurrenceCancelInput): { task: Task; recurrence: TaskRecurrence | null } {
    const { task, taskPatch, currentRecurrence, cancelDate, pattern, now } = input;
    const updatedTask = TaskFactory.replace(task, taskPatch);

    if (cancelDate == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Невозможно отменить recurrence без даты начала Task',
        field: 'startDate',
        taskId: updatedTask.id,
      });
    }

    const untilDate = timeAndDate(now).tz(currentRecurrence.timezone).startOf('day').utc().toISOString();
    const cancelledRecurrence = currentRecurrence.cancel({
      cancelDate: DateVo.create(untilDate),
      pattern,
    });

    return {
      task: updatedTask,
      recurrence: cancelledRecurrence.isEmpty ? null : cancelledRecurrence,
    };
  }

  private assertTaskPersisted(task: Task): void {
    if (task.isDraft) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Невозможно создать recurrence для черновой Task',
        field: 'taskId',
      });
    }
  }

  private canDeleteRecurrence(overrides: TaskOverride[]): boolean {
    return overrides.every((override) =>
      [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS, TaskStatus.ARCHIVED].includes(override.status),
    );
  }

  private assertOverridesBelongToRecurrence(input: {
    taskId: number;
    currentRecurrence: TaskRecurrence | null | undefined;
    currentOverrides: TaskOverride[];
  }): void {
    const { taskId, currentRecurrence, currentOverrides } = input;

    if (currentOverrides.length === 0) {
      return;
    }

    if (currentRecurrence == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Невозможно передать currentOverrides без currentRecurrence',
        field: 'currentOverrides',
        taskId,
      });
    }

    const hasForeignOverride = currentOverrides.some((override) => override.recurrenceId !== currentRecurrence.id);
    if (!hasForeignOverride) {
      return;
    }

    throw new ExceptionTaskDomainInvalidInvariant({
      message: 'Все currentOverrides должны принадлежать currentRecurrence',
      field: 'currentOverrides',
      taskId,
    });
  }

  private assertRecurrenceInvariants(input: {
    taskId: number;
    taskStartDate?: string;
    recurrenceStartDate: string;
    timezone: string;
  }): void {
    const { taskId, taskStartDate, recurrenceStartDate, timezone } = input;

    if (taskStartDate == null) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Если Task имеет recurrence, startDate обязателен',
        field: 'startDate',
        taskId,
      });
    }

    if (!this.isSameDayByTimezone({ left: taskStartDate, right: recurrenceStartDate, timezone })) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'startDate Task и TaskRecurrence.startDate должны быть в рамках одного дня таймзоны recurrence',
        field: 'startDate',
        taskId,
      });
    }
  }

  private isSameDayByTimezone(input: { left: string; right: string; timezone: string }): boolean {
    const { left, right, timezone } = input;
    return timeAndDate(left).tz(timezone).format('YYYY-MM-DD') === timeAndDate(right).tz(timezone).format('YYYY-MM-DD');
  }
}

export {
  TaskWithRecurrenceService,
  TaskWithRecurrenceInput,
  TaskWithRecurrenceCreateInput,
  TaskWithRecurrenceUpdateInput,
  TaskWithRecurrenceCancelInput,
  TaskWithRecurrenceReplaceInput,
  TaskWithRecurrenceReplaceResult,
};
