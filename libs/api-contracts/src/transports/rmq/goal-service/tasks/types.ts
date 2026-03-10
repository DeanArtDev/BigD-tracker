import { Frequency as RecurrenceFrequency, RRule } from 'rrule';

enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

enum TaskRecurrenceStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
}

// отличия от мастер-дела
enum TaskOverrideType {
  OVERRIDE = 'OVERRIDE',
  CANCELED = 'CANCELED',
  DELETED = 'DELETED',
  MOVED = 'MOVED',
  ARCHIVED = 'ARCHIVED',
}

enum TaskRecurrenceWeekday {
  MO = 0,
  TU = 1,
  WE = 2,
  TH = 3,
  FR = 4,
  SA = 5,
  SU = 6,
}

const numberToWeekdayMap = {
  0: RRule.MO,
  1: RRule.TU,
  2: RRule.WE,
  3: RRule.TH,
  4: RRule.FR,
  5: RRule.SA,
  6: RRule.SU,
};

const taskStatusToOverrideTypeMap: Record<TaskStatus, TaskOverrideType> = {
  [TaskStatus.NOT_STARTED]: TaskOverrideType.OVERRIDE,
  [TaskStatus.IN_PROGRESS]: TaskOverrideType.OVERRIDE,
  [TaskStatus.COMPLETED]: TaskOverrideType.OVERRIDE,
  [TaskStatus.OVERDUE]: TaskOverrideType.OVERRIDE,
  [TaskStatus.CANCELLED]: TaskOverrideType.CANCELED,
  [TaskStatus.ARCHIVED]: TaskOverrideType.ARCHIVED,
  [TaskStatus.DELETED]: TaskOverrideType.DELETED,
};

const recurrenceFrequencyToKeyMap: Record<RecurrenceFrequency, keyof typeof RecurrenceFrequency> = {
  0: 'YEARLY',
  1: 'MONTHLY',
  2: 'WEEKLY',
  3: 'DAILY',
  4: 'HOURLY',
  5: 'MINUTELY',
  6: 'SECONDLY',
};

export {
  TaskStatus,
  TaskOverrideType,
  TaskRecurrenceStatus,
  RecurrenceFrequency,
  TaskRecurrenceWeekday,
  numberToWeekdayMap,
  recurrenceFrequencyToKeyMap,
  taskStatusToOverrideTypeMap,
};
