import { TaskStatus } from '@/shared/transport/graphql';

const currentTasksStatuses: TaskStatus[] = [
  TaskStatus.NotStarted,
  TaskStatus.InProgress,
  TaskStatus.Completed,
  TaskStatus.Overdue,
  TaskStatus.Canceled,
];

export { currentTasksStatuses };
