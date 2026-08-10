import { Brand, DeepReadonly, Override } from '@/shared/lib';
import { TaskSchema } from '@/shared/transport/graphql';

type TaskId = Brand<string, 'TaskId'>;

type BrandTask<TData extends Record<string, unknown>> = Omit<DeepReadonly<TData>, 'id'> & {
  readonly id: TaskId;
};

type Task<BrandGroup extends Brand<number, string> = Brand<number, string>> = Override<
  BrandTask<Omit<TaskSchema, 'userId'>>,
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

export { TaskType, TaskActionType };
export type { TaskId, BrandTask, Task };
