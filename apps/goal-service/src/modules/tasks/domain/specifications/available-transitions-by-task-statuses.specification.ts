import { TaskStatus } from '@big-d/api-contracts';

const allowTaskStatusTransitions: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.NOT_STARTED]: [
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.OVERDUE,
    TaskStatus.CANCELLED,
    TaskStatus.ARCHIVED,
    TaskStatus.DELETED,
  ],

  [TaskStatus.IN_PROGRESS]: [
    TaskStatus.NOT_STARTED,
    TaskStatus.COMPLETED,
    TaskStatus.OVERDUE,
    TaskStatus.CANCELLED,
    TaskStatus.ARCHIVED,
    TaskStatus.DELETED,
  ],

  [TaskStatus.CANCELLED]: [TaskStatus.ARCHIVED, TaskStatus.DELETED],

  [TaskStatus.COMPLETED]: [],

  [TaskStatus.OVERDUE]: [],

  [TaskStatus.ARCHIVED]: [TaskStatus.DELETED],

  [TaskStatus.DELETED]: [],
};

type TaskStatusActions = keyof typeof allowedTaskStatusByAction;

const allowedTaskStatusByAction = {
  REPLACE: [TaskStatus.IN_PROGRESS, TaskStatus.NOT_STARTED],
  ASSIGN: [TaskStatus.IN_PROGRESS, TaskStatus.NOT_STARTED],
  UNASSIGN: [TaskStatus.IN_PROGRESS, TaskStatus.NOT_STARTED],
  FINISH: getStatusesToRich([TaskStatus.COMPLETED, TaskStatus.OVERDUE]),
  DELETE: getStatusesToRich([TaskStatus.DELETED]),
  CLONE: Object.values(TaskStatus),
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
