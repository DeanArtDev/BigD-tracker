import { RecurrenceFrequency, TaskRecurrenceStatus, TaskRecurrenceWeekday } from '@big-d/api-contracts';
import { DateVo, MonthdaysVo, TimezoneVo, YearmonthsVo } from '@big-d/api-utils';

interface TaskRecurrenceState {
  readonly id: number;
  readonly userId: number;
  readonly taskId: number;
  status: TaskRecurrenceStatus;
  timezone: TimezoneVo;
  startDate: DateVo;
  pattern: string;
  untilDate?: DateVo;
  interval?: number;
  frequency: {
    key: keyof typeof RecurrenceFrequency;
    value: RecurrenceFrequency;
  };
  weekstart: TaskRecurrenceWeekday;
  weekdays?: TaskRecurrenceWeekday[];
  monthdays?: MonthdaysVo;
  yearmonths?: YearmonthsVo;
}

interface TaskRecurrenceCreateInput {
  readonly userId: number;
  readonly taskId: number;
  readonly status: TaskRecurrenceStatus;
  readonly timezone: TimezoneVo;
  readonly startDate: DateVo;
  readonly pattern: string;
  readonly frequency: RecurrenceFrequency;
  readonly weekstart: TaskRecurrenceWeekday;
  readonly untilDate?: DateVo;
  readonly interval?: number;
  readonly weekdays?: TaskRecurrenceWeekday[];
  readonly monthdays?: MonthdaysVo;
  readonly yearmonths?: YearmonthsVo;
}

interface TaskRecurrenceReplaceInput {
  readonly startDate: DateVo;
  readonly status?: TaskRecurrenceStatus;
  readonly pattern: string;
  readonly frequency: RecurrenceFrequency;
  readonly weekstart: TaskRecurrenceWeekday;
  readonly untilDate?: DateVo;
  readonly interval?: number;
  readonly weekdays?: TaskRecurrenceWeekday[];
  readonly monthdays?: MonthdaysVo;
  readonly yearmonths?: YearmonthsVo;
}

interface TaskRecurrenceRestoreInput {
  readonly id: number;
  readonly userId: number;
  readonly taskId: number;
  readonly status: TaskRecurrenceStatus;
  readonly timezone: TimezoneVo;
  readonly startDate: DateVo;
  readonly pattern: string;
  readonly frequency: RecurrenceFrequency;
  readonly weekstart: TaskRecurrenceWeekday;
  readonly untilDate?: DateVo;
  readonly interval?: number;
  readonly weekdays?: TaskRecurrenceWeekday[];
  readonly monthdays?: MonthdaysVo;
  readonly yearmonths?: YearmonthsVo;
}

export { TaskRecurrenceRestoreInput, TaskRecurrenceCreateInput, TaskRecurrenceState, TaskRecurrenceReplaceInput };
