import { TaskStatus } from '@big-d/api-contracts';

const tasksQuerySpec = {
  readableStatuses: [
    TaskStatus.NOT_STARTED,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.OVERDUE,
    TaskStatus.CANCELED,
  ],
  unavailableStatuses: [TaskStatus.ARCHIVED, TaskStatus.DELETED],
};

export { tasksQuerySpec };
