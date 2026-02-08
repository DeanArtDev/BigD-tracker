import { TaskStatus } from './task.entity';

enum TaskActionType {
  CLONE = 'CLONE',
  DELETE = 'DELETE',
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
  FINISH = 'FINISH',
}

const actionToStatuesMap = {
  [TaskActionType.DELETE]: [
    TaskStatus.NOT_STARTED,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.OVERDUE,
    TaskStatus.CANCELLED,
    TaskStatus.ARCHIVED,
  ],

  [TaskActionType.CLONE]: [
    TaskStatus.NOT_STARTED,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.OVERDUE,
    TaskStatus.CANCELLED,
    TaskStatus.ARCHIVED,
    TaskStatus.DELETED,
  ],

  [TaskActionType.ASSIGN]: [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS],

  [TaskActionType.UNASSIGN]: [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS],

  [TaskActionType.FINISH]: [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS],
};

export { actionToStatuesMap, TaskActionType };
