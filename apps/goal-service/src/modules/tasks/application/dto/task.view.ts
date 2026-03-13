import { RecurrenceFrequency, TaskRecurrenceStatus, TaskRecurrenceWeekday, TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { TaskRecurrenceValues } from '../types';

interface TaskViewRecurrenceRestoreInput {
  startDate: DateVo;
  frequency: RecurrenceFrequency;
  untilDate?: DateVo;
  interval?: number;
  weekstart?: TaskRecurrenceWeekday;
  weekdays?: TaskRecurrenceWeekday[];
  monthdays?: number[];
  yearmonths?: number[];
  readonly status?: TaskRecurrenceStatus;
}

interface TaskViewState {
  readonly id: string;
  readonly userId: number;
  readonly groupId?: number;
  readonly name: string;
  readonly description?: string;
  readonly priority: number;
  readonly weight: number;
  readonly cancelReason?: string;
  readonly startDate?: DateVo;
  readonly deadline?: DateVo;
  readonly endDate?: DateVo;
  readonly status: TaskStatus;
  readonly recurrence?: TaskViewRecurrenceRestoreInput;
}

class TaskView {
  constructor(
    public readonly id: string,
    public readonly userId: number,
    public readonly name: string,
    public readonly priority: number,
    public readonly weight: number,
    public readonly status: TaskStatus,
    public readonly groupId?: number,
    public readonly description?: string,
    public readonly cancelReason?: string,
    public readonly startDate?: string,
    public readonly deadline?: string,
    public readonly endDate?: string,
    public readonly recurrence?: TaskRecurrenceValues,
  ) {}

  static restore(input: TaskViewState): TaskView {
    const recurrence =
      input.recurrence?.status === TaskRecurrenceStatus.ACTIVE
        ? {
            startDate: input.recurrence.startDate.value,
            frequency: input.recurrence.frequency,
            untilDate: input.recurrence.untilDate?.value,
            interval: input.recurrence.interval,
            weekstart: input.recurrence.weekstart,
            weekdays: input.recurrence.weekdays,
            monthdays: input.recurrence.monthdays,
            yearmonths: input.recurrence.yearmonths,
          }
        : undefined;

    return new TaskView(
      input.id,
      input.userId,
      input.name,
      input.priority,
      input.weight,
      input.status,
      input.groupId,
      input.description,
      input.cancelReason,
      input.startDate?.value,
      input.deadline?.value,
      input.endDate?.value,
      recurrence,
    );
  }
}

export { TaskView, TaskViewState };
