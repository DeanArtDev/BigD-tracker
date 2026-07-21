import { GroupId } from '@/entity/planner/groups';
import { TaskPriority, TaskStatus } from '@/entity/schema-types';
import { Brand, DeepReadonly } from '@/shared/lib';

type TaskId = Brand<string, 'TaskId'>;

type BrandTask<TData extends Record<string, unknown>> = Omit<DeepReadonly<TData>, 'id'> & {
  readonly id: TaskId;
};

interface Task {
  readonly id: TaskId;
  readonly name: string;
  readonly description?: string | null;
  readonly groupId?: GroupId;
  readonly priority: TaskPriority;
  readonly cancelReason?: string | null;
  readonly startDate?: string | null;
  readonly deadline?: string | null;
  readonly endDate?: string | null;
  readonly status: TaskStatus;
}

enum TaskType {
  Original = 'ORIGINAL',
  OriginalRecurrence = 'ORIGINAL_RECURRENCE',
  Virtual = 'VIRTUAL',
  Override = 'OVERRIDE',
  Unknown = 'UNKNOWN',
}

enum TaskActionType {
  Clone = 'CLONE',
  Delete = 'DELETE',
  DeleteComplete = 'DELETE_COMPLETE',
  Assign = 'ASSIGN',
  Unassign = 'UNASSIGN',
  Finish = 'FINISH',
  Recover = 'RECOVER',
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

export { TaskType, TaskActionType, TaskRecurrenceWeekday, TaskRecurrenceFrequency };
export type { TaskId, BrandTask, Task };
