import { TaskStatus } from '@big-d/api-contracts';

const allowTaskStatusTransitions: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.NOT_STARTED]: [
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.OVERDUE,
    TaskStatus.CANCELED,
    TaskStatus.ARCHIVED,
    TaskStatus.DELETED,
  ],

  [TaskStatus.IN_PROGRESS]: [
    TaskStatus.NOT_STARTED,
    TaskStatus.COMPLETED,
    TaskStatus.OVERDUE,
    TaskStatus.CANCELED,
    TaskStatus.ARCHIVED,
    TaskStatus.DELETED,
  ],

  [TaskStatus.CANCELED]: [TaskStatus.ARCHIVED, TaskStatus.DELETED],

  [TaskStatus.COMPLETED]: [TaskStatus.DELETED],

  [TaskStatus.OVERDUE]: [TaskStatus.DELETED],

  [TaskStatus.ARCHIVED]: [TaskStatus.DELETED],

  [TaskStatus.DELETED]: [TaskStatus.NOT_STARTED],
};

type TaskStatusActions = keyof typeof allowedTaskStatusByAction;

const allowedTaskStatusByAction = {
  REPLACE_EVERYTHING: [TaskStatus.IN_PROGRESS, TaskStatus.NOT_STARTED],
  REPLACE_PARTLY: [
    TaskStatus.NOT_STARTED,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.OVERDUE,
    TaskStatus.CANCELED,
    TaskStatus.ARCHIVED,
    TaskStatus.DELETED,
  ],
  ASSIGN: [TaskStatus.IN_PROGRESS, TaskStatus.NOT_STARTED],
  UNASSIGN: [TaskStatus.IN_PROGRESS, TaskStatus.NOT_STARTED],
  FINISH: getStatusesToRich([TaskStatus.COMPLETED, TaskStatus.OVERDUE]),
  DELETE: getStatusesToRich([TaskStatus.DELETED]),
  CLONE: Object.values(TaskStatus),
  DELETE_COMPLETE: [TaskStatus.DELETED],
  RECOVERY: [TaskStatus.DELETED],
};

/**
 * Формирует список по каким ключевым статусам можно добраться до целевых статусов
 * */
function getStatusesToRich(statuses: TaskStatus[]): TaskStatus[] {
  const buffer: TaskStatus[] = [];
  for (const [key, list] of Object.entries(allowTaskStatusTransitions)) {
    if (list.some((s) => statuses.includes(s))) {
      buffer.push(key as TaskStatus);
    }
  }
  return buffer;
}

export { allowTaskStatusTransitions, allowedTaskStatusByAction, type TaskStatusActions };
