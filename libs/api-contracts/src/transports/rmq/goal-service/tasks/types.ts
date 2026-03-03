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

export { TaskStatus, TaskOverrideType, RecurrenceFrequency, TaskRecurrenceWeekday, numberToWeekdayMap };
