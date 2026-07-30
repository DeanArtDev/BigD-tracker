import { Brand, DeepReadonly, Override } from '@/shared/lib';
import { TaskSchema } from '@/shared/transport/graphql';

type TaskId = Brand<string, 'TaskId'>;

type BrandTask<TData extends Record<string, unknown>> = Omit<DeepReadonly<TData>, 'id'> & {
  readonly id: TaskId;
};

type Task<BrandGroup extends Brand<number, string> = Brand<number, string>> = Override<
  BrandTask<NonNullable<Omit<TaskSchema, 'userId' | 'weight'>>>,
  { groupId?: BrandGroup }
>;

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
