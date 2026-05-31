import { TaskStatus } from '@/entity/schema-types';
import { TaskActionType } from '../task.entity';

const taskActionByStatusesAvailability = {
  [TaskActionType.Delete]: [
    TaskStatus.NotStarted,
    TaskStatus.InProgress,
    TaskStatus.Canceled,
    TaskStatus.Overdue,
    TaskStatus.Canceled,
    TaskStatus.Archived,
  ],

  [TaskActionType.Clone]: [
    TaskStatus.NotStarted,
    TaskStatus.InProgress,
    TaskStatus.Canceled,
    TaskStatus.Overdue,
    TaskStatus.Canceled,
    TaskStatus.Archived,
    TaskStatus.Deleted,
  ],

  [TaskActionType.Assign]: [TaskStatus.NotStarted, TaskStatus.InProgress],

  [TaskActionType.Unassign]: [TaskStatus.NotStarted, TaskStatus.InProgress],

  [TaskActionType.Finish]: [TaskStatus.NotStarted, TaskStatus.InProgress],

  [TaskActionType.Recover]: [TaskStatus.Deleted],

  [TaskActionType.DeleteComplete]: [TaskStatus.Deleted],
};

export { taskActionByStatusesAvailability };
