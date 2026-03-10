import { RecurrenceFrequency, TaskRecurrenceStatus, TaskRecurrenceWeekday } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';

interface TaskRecurrenceState {
  readonly id: number;
  readonly userId: number;
  readonly taskId: number;
  status: TaskRecurrenceStatus;
  timezone: string;
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
  monthdays?: number[];
  yearmonths?: number[];
}

interface TaskRecurrenceCreateInput {
  readonly userId: number;
  readonly taskId: number;
  readonly status: TaskRecurrenceStatus;
  readonly timezone: string;
  readonly startDate: DateVo;
  readonly pattern: string;
  readonly frequency: RecurrenceFrequency;
  readonly weekstart: TaskRecurrenceWeekday;
  readonly untilDate?: DateVo;
  readonly interval?: number;
  readonly weekdays?: TaskRecurrenceWeekday[];
  readonly monthdays?: number[];
  readonly yearmonths?: number[];
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
  readonly monthdays?: number[];
  readonly yearmonths?: number[];
}

interface TaskRecurrenceRestoreInput {
  readonly id: number;
  readonly userId: number;
  readonly taskId: number;
  readonly status: TaskRecurrenceStatus;
  readonly timezone: string;
  readonly startDate: DateVo;
  readonly pattern: string;
  readonly frequency: RecurrenceFrequency;
  readonly weekstart: TaskRecurrenceWeekday;
  readonly untilDate?: DateVo;
  readonly interval?: number;
  readonly weekdays?: TaskRecurrenceWeekday[];
  readonly monthdays?: number[];
  readonly yearmonths?: number[];
}

export { TaskRecurrenceRestoreInput, TaskRecurrenceCreateInput, TaskRecurrenceState, TaskRecurrenceReplaceInput };
