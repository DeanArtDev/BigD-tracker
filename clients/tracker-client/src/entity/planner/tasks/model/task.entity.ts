import type { ApiSchemas } from '@/shared/api/types';
import type { Override } from '@/shared/lib/type-helpers';

enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

enum TaskQueryStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

enum TaskRecurrenceFrequency {
  YEARLY = 0,
  MONTHLY = 1,
  WEEKLY = 2,
  DAILY = 3,
  HOURLY = 4,
  MINUTELY = 5,
  SECONDLY = 6,
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

enum TaskPriority {
  DO = 1, // Важно и Срочно → Делай
  PLAN = 2, // Важно и Несрочно → Планируй
  DELEGATE = 3, // Неважно, но Срочно → Делегируй
  DELETE = 4, // Неважно и Несрочно → Удали
}

enum TaskType {
  ORIGINAL = 'ORIGINAL',
  ORIGINAL_RECURRENCE = 'ORIGINAL_RECURRENCE',
  VIRTUAL = 'VIRTUAL',
  OVERRIDE = 'OVERRIDE',
  UNKNOWN = 'UNKNOWN',
}

type OverrideStatus = Override<Omit<ApiSchemas['TaskDto'], 'userId'>, 'status', TaskStatus>;
type TaskEntity = Override<OverrideStatus, 'priority', TaskPriority> & { type: TaskType };

export { type TaskEntity };
export { TaskRecurrenceFrequency, TaskStatus, TaskQueryStatus, TaskRecurrenceWeekday, TaskType, TaskPriority };
