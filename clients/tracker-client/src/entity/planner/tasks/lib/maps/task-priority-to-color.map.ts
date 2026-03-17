import { TaskPriority } from '../../model';

const taskPriorityColorMap = {
  [TaskPriority.DO]: '--priority-1',
  [TaskPriority.PLAN]: '--priority-2',
  [TaskPriority.DELEGATE]: '--priority-3',
  [TaskPriority.DELETE]: '--priority-4',
};

export { taskPriorityColorMap };
