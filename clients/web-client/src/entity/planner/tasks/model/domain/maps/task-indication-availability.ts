import { TaskStatus } from '@/shared/transport/graphql';
import { TaskType } from '../task';

const taskIndicationByStatus: Record<TaskStatus, boolean> = {
  [TaskStatus.NotStarted]: true,
  [TaskStatus.InProgress]: true,
  [TaskStatus.Canceled]: false,
  [TaskStatus.Overdue]: false,
  [TaskStatus.Completed]: false,
  [TaskStatus.Archived]: false,
  [TaskStatus.Deleted]: false,
};

const taskIndicationByType: Record<TaskType, boolean> = {
  [TaskType.Override]: true,
  [TaskType.Virtual]: true,
  [TaskType.Original]: true,
  [TaskType.OriginalRecurrence]: false,
  [TaskType.Unknown]: false,
};

export { taskIndicationByStatus, taskIndicationByType };
