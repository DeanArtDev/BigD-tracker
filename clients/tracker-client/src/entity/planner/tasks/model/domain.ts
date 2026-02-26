import { TaskStatus } from './task.entity';

enum TaskActionType {
  CLONE = 'CLONE',
  DELETE = 'DELETE',
  DELETE_COMPLETE = 'DELETE_COMPLETE',
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
  FINISH = 'FINISH',
  RECOVER = 'RECOVER',
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

  [TaskActionType.RECOVER]: [TaskStatus.DELETED],

  [TaskActionType.DELETE_COMPLETE]: [TaskStatus.DELETED],
};

const allowIndicationStatusMap = {
  [TaskStatus.NOT_STARTED]: true,
  [TaskStatus.IN_PROGRESS]: true,
  [TaskStatus.COMPLETED]: false,
  [TaskStatus.OVERDUE]: false,
  [TaskStatus.CANCELLED]: false,
  [TaskStatus.ARCHIVED]: false,
  [TaskStatus.DELETED]: false,
};

export { actionToStatuesMap, allowIndicationStatusMap, TaskActionType };
