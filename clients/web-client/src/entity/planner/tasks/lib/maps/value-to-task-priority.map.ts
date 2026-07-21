import { TaskPriority } from '@/entity/schema-types';

const valueToTaskPriority: Record<number, TaskPriority> = {
  1: TaskPriority.Do,
  2: TaskPriority.Plan,
  3: TaskPriority.Delegate,
  4: TaskPriority.Delete,
};

export { valueToTaskPriority };
