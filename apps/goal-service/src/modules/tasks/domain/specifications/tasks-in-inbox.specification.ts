import { TaskStatus } from '@big-d/api-contracts';

const tasksAreInInboxSpec = {
  default: [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS],
  extendable: [TaskStatus.COMPLETED, TaskStatus.OVERDUE],
};

export { tasksAreInInboxSpec };
