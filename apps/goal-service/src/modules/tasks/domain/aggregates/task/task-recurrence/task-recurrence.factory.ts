import { TaskRecurrence } from '@/modules/tasks/domain';
import { RecurrenceFrequency, TaskRecurrenceWeekday } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';

interface TaskRecurrenceCreateInput {
  readonly userId: number;
  readonly taskId: number;
  readonly timezone: string;
  readonly startDate: string;
  readonly pattern: string;
  readonly frequency: RecurrenceFrequency;
  readonly weekstart?: number;
  readonly untilDate?: string;
  readonly interval?: number;
  readonly weekdays?: number[];
  readonly monthdays?: number[];
  readonly yearmonths?: number[];
}

interface TaskRecurrenceReplaceInput {
  readonly startDate: string;
  readonly pattern: string;
  readonly frequency: RecurrenceFrequency;
  readonly weekstart?: TaskRecurrenceWeekday;
  readonly untilDate?: string;
  readonly interval?: number;
  readonly weekdays?: TaskRecurrenceWeekday[];
  readonly monthdays?: number[];
  readonly yearmonths?: number[];
}

class TaskRecurrenceFactory {
  static WEEK_DEFAULT = 0;

  static create(input: TaskRecurrenceCreateInput): TaskRecurrence {
    return TaskRecurrence.create({
      userId: input.userId,
      taskId: input.taskId,
      timezone: input.timezone,
      startDate: DateVo.create(input.startDate),
      pattern: input.pattern,
      frequency: input.frequency,
      weekstart: input.weekstart ?? TaskRecurrenceFactory.WEEK_DEFAULT,
      untilDate: input.untilDate != null ? DateVo.create(input.untilDate) : undefined,
      interval: input.interval,
      weekdays: input.weekdays,
      monthdays: input.monthdays,
      yearmonths: input.yearmonths,
    });
  }

  static update(recurrence: TaskRecurrence, patch: TaskRecurrenceReplaceInput): TaskRecurrence {
    return recurrence.replace({
      startDate: DateVo.create(patch.startDate),
      pattern: patch.pattern,
      frequency: patch.frequency,
      weekstart: patch.weekstart ?? TaskRecurrenceFactory.WEEK_DEFAULT,
      untilDate: patch.untilDate != null ? DateVo.create(patch.untilDate) : undefined,
      interval: patch.interval,
      weekdays: patch.weekdays,
      monthdays: patch.monthdays,
      yearmonths: patch.yearmonths,
    });
  }

  static cancel(recurrence: TaskRecurrence, patch: { cancelDate: string; pattern: string }): TaskRecurrence {
    return recurrence.cancel({
      cancelDate: DateVo.create(patch.cancelDate),
      pattern: patch.pattern,
    });
  }
}

export { TaskRecurrenceFactory };
