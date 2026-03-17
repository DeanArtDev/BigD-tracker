import { TaskPriority } from '../../model';

const priorityToKeyMap: Record<number, TaskPriority> = {
  1: TaskPriority.DO,
  2: TaskPriority.PLAN,
  3: TaskPriority.DELEGATE,
  4: TaskPriority.DELETE,
};

export { priorityToKeyMap };
