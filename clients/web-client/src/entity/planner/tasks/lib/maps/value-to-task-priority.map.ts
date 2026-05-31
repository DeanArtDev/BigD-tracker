import { TaskPriority } from '../../model';

const valueToTaskPriority: Record<number, TaskPriority> = {
  1: TaskPriority.DO,
  2: TaskPriority.PLAN,
  3: TaskPriority.DELEGATE,
  4: TaskPriority.DELETE,
};

export { valueToTaskPriority };
