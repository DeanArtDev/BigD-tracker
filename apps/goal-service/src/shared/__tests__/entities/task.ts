import { TaskView } from '@/modules/tasks/application/dto';
import { TaskRecurrenceValues } from '@/modules/tasks/application/types';
import { Task, TaskIdBuilder, TaskRecurrence } from '@/modules/tasks/domain';
import { Priority, Weight } from '@/modules/tasks/domain';
import { RecurrenceFrequency, TaskRecurrenceStatus, TaskRecurrenceWeekday, TaskStatus } from '@big-d/api-contracts';
import { DateVo, MonthdaysVo, Name, TimezoneVo, YearmonthsVo } from '@big-d/api-utils';

type TestTaskRecurrenceInput = Omit<Partial<TaskRecurrenceValues>, 'frequency'> & {
  start?: string;
  end?: string;
  status?: TaskRecurrenceStatus;
  frequency?:
    | RecurrenceFrequency
    | {
        key: keyof typeof RecurrenceFrequency;
        value: RecurrenceFrequency;
      };
  weekdays?: TaskRecurrenceWeekday[];
};

const unwrapFrequency = (frequency?: TestTaskRecurrenceInput['frequency']): RecurrenceFrequency | undefined => {
  if (frequency == null) return undefined;
  if (typeof frequency === 'object') return frequency.value;
  return frequency;
};

const normalizeRecurrence = (recurrence?: TestTaskRecurrenceInput): TaskRecurrenceValues | undefined => {
  if (recurrence == null) return undefined;

  const startDate = recurrence.startDate ?? recurrence.start;
  if (startDate == null) return undefined;

  return {
    startDate,
    untilDate: recurrence.untilDate ?? recurrence.end,
    frequency: unwrapFrequency(recurrence.frequency) ?? RecurrenceFrequency.DAILY,
    interval: recurrence.interval,
    weekstart: recurrence.weekstart,
    weekdays: recurrence.weekdays,
    monthdays: recurrence.monthdays,
    yearmonths: recurrence.yearmonths,
  };
};

const normalizeTaskViewRecurrence = (recurrence?: TestTaskRecurrenceInput) => {
  const normalized = normalizeRecurrence(recurrence);

  if (normalized == null) {
    return undefined;
  }

  return {
    ...normalized,
    startDate: DateVo.restore(normalized.startDate),
    untilDate: normalized.untilDate != null ? DateVo.restore(normalized.untilDate) : undefined,
    status:
      'status' in (recurrence ?? {}) && recurrence?.status != null ? recurrence.status : TaskRecurrenceStatus.ACTIVE,
  };
};

const getTask = (
  data: Partial<{
    id: number;
    userId: number;
    name: string;
    description?: string;
    priority: number;
    weight: number;
    startDate?: string;
    deadline?: string;
    status: TaskStatus;
    recurrenceId?: number;
    recurrence?: TestTaskRecurrenceInput;
  }> = {},
): Task => {
  return Task.restore({
    id: data.id ?? 1,
    userId: data.userId ?? 1,
    name: Name.restore(data.name ?? 'Task name'),
    description: data.description,
    priority: Priority.restore(data.priority ?? 2),
    weight: Weight.restore(data.weight ?? 1),
    startDate: data.startDate != null ? DateVo.restore(data.startDate) : undefined,
    deadline: data.deadline != null ? DateVo.restore(data.deadline) : undefined,
    endDate: undefined,
    status: data.status ?? TaskStatus.NOT_STARTED,
    recurrenceId: data.recurrenceId,
  });
};

const getTaskView = (
  data: Partial<{
    id: string | number;
    userId: number;
    name: string;
    description?: string;
    priority: number;
    weight: number;
    cancelReason?: string;
    startDate?: string;
    endDate?: string;
    deadline?: string;
    status: TaskStatus;
    recurrence?: TestTaskRecurrenceInput;
  }> = {},
): TaskView => {
  const recurrence = normalizeTaskViewRecurrence(data.recurrence);

  return TaskView.restore({
    id: data.id == null ? TaskIdBuilder.wrapOriginId(1) : toTaskViewId(data.id),
    userId: data.userId ?? 1,
    name: data.name ?? 'Task name',
    description: data.description,
    priority: data.priority ?? 2,
    weight: data.weight ?? 1,
    cancelReason: data.cancelReason,
    startDate: data.startDate != null ? DateVo.restore(data.startDate) : undefined,
    deadline: data.deadline != null ? DateVo.restore(data.deadline) : undefined,
    endDate: data.endDate != null ? DateVo.restore(data.endDate) : undefined,
    status: data.status ?? TaskStatus.NOT_STARTED,
    recurrence,
  });
};

const getTaskRecurrence = (
  data: Partial<{
    id: number;
    userId: number;
    taskId: number;
    status: TaskRecurrenceStatus;
    timezone: string;
    startDate: string;
    untilDate?: string;
    pattern: string;
    frequency: RecurrenceFrequency;
    weekstart: TaskRecurrenceWeekday;
    interval?: number;
    weekdays?: TaskRecurrenceWeekday[];
    monthdays?: number[];
    yearmonths?: number[];
  }> = {},
): TaskRecurrence => {
  return TaskRecurrence.restore({
    id: data.id ?? 1,
    userId: data.userId ?? 1,
    taskId: data.taskId ?? 1,
    status: data.status ?? TaskRecurrenceStatus.ACTIVE,
    timezone: TimezoneVo.create(data.timezone ?? 'UTC'),
    startDate: DateVo.restore(data.startDate ?? '2026-01-01T10:00:00.000Z'),
    untilDate: data.untilDate != null ? DateVo.restore(data.untilDate) : undefined,
    pattern: data.pattern ?? 'FREQ=DAILY;INTERVAL=1',
    frequency: data.frequency ?? RecurrenceFrequency.DAILY,
    weekstart: data.weekstart ?? TaskRecurrenceWeekday.MO,
    interval: data.interval,
    weekdays: data.weekdays,
    monthdays: data.monthdays != null ? MonthdaysVo.create(data.monthdays) : undefined,
    yearmonths: data.yearmonths != null ? YearmonthsVo.create(data.yearmonths) : undefined,
  });
};

function toTaskViewId(id: string | number): string {
  return typeof id === 'string' ? id : TaskIdBuilder.wrapOriginId(id);
}

export { getTask, getTaskRecurrence, getTaskView };
