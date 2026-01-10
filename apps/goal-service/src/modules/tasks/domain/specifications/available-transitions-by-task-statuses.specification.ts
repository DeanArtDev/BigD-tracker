import { TaskStatus } from '@big-d/api-contracts';

const availableTransitionsByTaskStatuses: Record<TaskStatus, TaskStatus[]> = {
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

  [TaskStatus.COMPLETED]: [],
  [TaskStatus.OVERDUE]: [],
  [TaskStatus.CANCELLED]: [TaskStatus.ARCHIVED, TaskStatus.DELETED],
  [TaskStatus.ARCHIVED]: [],
  [TaskStatus.DELETED]: [],
};

export { availableTransitionsByTaskStatuses };
