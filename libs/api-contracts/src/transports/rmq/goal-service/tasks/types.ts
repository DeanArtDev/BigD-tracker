import { Frequency as RecurrenceFrequency } from 'rrule';

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

export { TaskStatus, TaskOverrideType, RecurrenceFrequency, TaskRecurrenceWeekday };
