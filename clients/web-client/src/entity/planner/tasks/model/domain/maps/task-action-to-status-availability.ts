import { TaskStatus } from '@/entity/schema-types';
import { TaskActionType } from '../task';

const taskActionByStatusesAvailability = {
  [TaskActionType.Delete]: [
    TaskStatus.NotStarted,
    TaskStatus.InProgress,
    TaskStatus.Completed,
    TaskStatus.Overdue,
    TaskStatus.Canceled,
    TaskStatus.Archived,
  ],

  [TaskActionType.Clone]: [
    TaskStatus.NotStarted,
    TaskStatus.InProgress,
    TaskStatus.Completed,
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
