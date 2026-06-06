import { Brand, DeepReadonly } from '@/shared/lib';

type TaskId = Brand<string, 'TaskId'>;

type BrandTask<TData extends Record<string, unknown>> = Omit<DeepReadonly<TData>, 'id'> & {
  readonly id: TaskId;
};

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

enum TaskPriority {
  DO = 1, // Важно и Срочно → Делай
  PLAN = 2, // Важно и Несрочно → Планируй
  DELEGATE = 3, // Неважно, но Срочно → Делегируй
  DELETE = 4, // Неважно и Несрочно → Удали
}

export { TaskType, TaskActionType, TaskPriority };
export type { TaskId, BrandTask };
