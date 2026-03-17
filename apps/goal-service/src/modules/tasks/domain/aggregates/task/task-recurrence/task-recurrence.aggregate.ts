import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { RecurrenceFrequency, recurrenceFrequencyToKeyMap, TaskRecurrenceStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { taskAsserts } from '../tasks.invariants';
import {
  TaskRecurrenceCreateInput,
  TaskRecurrenceReplaceInput,
  TaskRecurrenceRestoreInput,
  TaskRecurrenceState,
} from './task-recurrence.types';

class TaskRecurrence {
  #state: TaskRecurrenceState;

  private constructor(input: Readonly<TaskRecurrenceState>) {
    this.#state = input;
  }

  static create(input: TaskRecurrenceCreateInput): TaskRecurrence {
    taskAsserts.datesIntersections({ end: input.untilDate, start: input.startDate });
    TaskRecurrence.assertWeekdaysForWeeklyFrequency({ frequency: input.frequency, weekdays: input.weekdays });

    return new TaskRecurrence({
      id: NaN,
      userId: input.userId,
      taskId: input.taskId,
      status: input.status,
      timezone: input.timezone,
      startDate: input.startDate,
      pattern: input.pattern,
      untilDate: input.untilDate,
      yearmonths: input.yearmonths,
      frequency: { key: recurrenceFrequencyToKeyMap[input.frequency], value: input.frequency },
      interval: input.interval,
      monthdays: input.monthdays,
      weekstart: input.weekstart,
      weekdays: input.weekdays,
    });
  }

  static restore(input: TaskRecurrenceRestoreInput): TaskRecurrence {
    return new TaskRecurrence({
      id: input.id,
      userId: input.userId,
      taskId: input.taskId,
      status: input.status,
      timezone: input.timezone,
      startDate: input.startDate,
      pattern: input.pattern,
      untilDate: input.untilDate,
      yearmonths: input.yearmonths,
      frequency: { key: recurrenceFrequencyToKeyMap[input.frequency], value: input.frequency },
      interval: input.interval,
      monthdays: input.monthdays,
      weekstart: input.weekstart,
      weekdays: input.weekdays,
    });
  }

  public replace(input: TaskRecurrenceReplaceInput): TaskRecurrence {
    taskAsserts.datesIntersections({
      start: input.startDate,
      end: input.untilDate ?? this.#state.untilDate,
    });
    TaskRecurrence.assertWeekdaysForWeeklyFrequency({
      frequency: input.frequency,
      weekdays: input.weekdays,
      taskId: this.#state.taskId,
    });

    this.#state.pattern = input.pattern;
    this.#state.startDate = input.startDate;
    this.#state.untilDate = input.untilDate;
    this.#state.status = input.status ?? this.#state.status;
    this.#state.frequency = { key: recurrenceFrequencyToKeyMap[input.frequency], value: input.frequency };
    this.#state.interval = input.interval;
    this.#state.weekstart = input.weekstart;
    this.#state.weekdays = input.weekdays;
    this.#state.monthdays = input.monthdays;
    this.#state.yearmonths = input.yearmonths;

    return this;
  }

  public cancel(input: { startDate: DateVo; cancelDate: DateVo; pattern: string }): TaskRecurrence {
    taskAsserts.datesIntersections({ start: input.startDate, end: input.cancelDate });

    this.#state.status = TaskRecurrenceStatus.CANCELED;
    this.#state.pattern = input.pattern;
    this.#state.untilDate = input.cancelDate;
    this.#state.startDate = input.startDate;

    return this;
  }

  get id() {
    return this.#state.id;
  }
  get taskId() {
    return this.#state.taskId;
  }
  get userId() {
    return this.#state.userId;
  }
  get timezone() {
    return this.#state.timezone.value;
  }
  get status() {
    return this.#state.status;
  }
  get startDate() {
    return this.#state.startDate.value;
  }
  get pattern() {
    return this.#state.pattern;
  }
  get untilDate() {
    return this.#state.untilDate?.value;
  }
  get frequency() {
    return this.#state.frequency;
  }
  get interval() {
    return this.#state.interval;
  }
  get weekstart() {
    return this.#state.weekstart;
  }
  get weekdays() {
    return this.#state.weekdays;
  }
  get monthdays() {
    return this.#state.monthdays?.value;
  }
  get yearmonths() {
    return this.#state.yearmonths?.value;
  }

  get isDraft() {
    return Number.isNaN(this.#state.id);
  }

  get isCanceled() {
    return this.#state.status === TaskRecurrenceStatus.CANCELED;
  }

  private static assertWeekdaysForWeeklyFrequency(input: {
    frequency: RecurrenceFrequency;
    weekdays?: TaskRecurrenceState['weekdays'];
    taskId?: number;
  }): void {
    if (input.frequency === RecurrenceFrequency.WEEKLY && (input.weekdays?.length ?? 0) === 0) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Для WEEKLY recurrence нужно указать хотя бы один weekday',
        field: 'weekdays',
        taskId: input.taskId,
      });
    }
  }
}

export { TaskRecurrence };
