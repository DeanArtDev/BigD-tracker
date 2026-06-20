import { TaskStatus } from './tasks';

const AvailableToViewTasksStatuses: TaskStatus[] = [
  TaskStatus.NOT_STARTED,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
  TaskStatus.OVERDUE,
  TaskStatus.CANCELED,
];

export { AvailableToViewTasksStatuses };
