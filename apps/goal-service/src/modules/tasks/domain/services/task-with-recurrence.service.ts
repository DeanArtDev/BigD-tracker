import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { DateVo } from '@big-d/api-utils';
import { timeAndDate } from '@shared/date-and-time';
import { Task, TaskFactory, TaskFactoryReplaceInput, TaskRecurrence } from '../aggregates/task';

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
  readonly currentRecurrence?: TaskRecurrence | null;
  readonly recurrencePatch?: TaskWithRecurrenceInput;
  readonly cancelDate?: string;
  readonly cancelPattern?: string;
  readonly now?: string;
}

interface TaskWithRecurrenceReplaceResult {
  readonly task: Task;
  readonly recurrence: TaskRecurrence | null;
  readonly isCreate: boolean;
  readonly isUpdate: boolean;
  readonly isCancel: boolean;
}

class TaskWithRecurrenceService {
  replace(input: TaskWithRecurrenceReplaceInput): TaskWithRecurrenceReplaceResult {
    const { task, taskPatch, currentRecurrence, recurrencePatch, cancelDate, cancelPattern, now } = input;
    const isCreate = currentRecurrence == null && recurrencePatch != null;
    const isUpdate = currentRecurrence != null && recurrencePatch != null;
    const isCancel = currentRecurrence != null && recurrencePatch == null;

    if (isCreate) {
      const next = this.update({
        task,
        taskPatch,
        currentRecurrence,
        recurrencePatch,
      });

      return {
        ...next,
        isCreate: true,
        isUpdate: false,
        isCancel: false,
      };
    }

    if (isUpdate) {
      const next = this.update({
        task,
        taskPatch,
        currentRecurrence,
        recurrencePatch,
      });

      return {
        ...next,
        isCreate: false,
        isUpdate: true,
        isCancel: false,
      };
    }

    if (isCancel) {
      if (cancelPattern == null) {
        throw new ExceptionTaskDomainInvalidInvariant({
          message: 'Невозможно отменить recurrence без cancel pattern',
          field: 'recurrence',
          taskId: task.id,
        });
      }

      const next = this.cancel({
        task,
        taskPatch,
        currentRecurrence,
        cancelDate,
        pattern: cancelPattern,
        now,
      });

      return {
        ...next,
        isCreate: false,
        isUpdate: false,
        isCancel: true,
      };
    }

    return {
      task: TaskFactory.replace(task, taskPatch),
      recurrence: null,
      isCreate: false,
      isUpdate: false,
      isCancel: false,
    };
  }

  create(input: TaskWithRecurrenceCreateInput): { task: Task; recurrence: TaskRecurrence } {
    const { task, recurrence } = input;

    this.assertTaskPersisted(task);
    this.assertRecurrenceInvariants({
      taskId: task.id,
      taskStartDate: task.startDate,
      recurrenceStartDate: recurrence.startDate,
      timezone: recurrence.timezone,
    });

    return {
      task,
      recurrence: TaskRecurrence.create({
        userId: task.userId,
        taskId: task.id,
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
