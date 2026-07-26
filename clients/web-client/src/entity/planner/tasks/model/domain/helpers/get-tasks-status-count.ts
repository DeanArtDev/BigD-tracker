import { TaskStatus } from '@/shared/transport/graphql';

interface TasksStatusCount {
  total: number;
  overdue: number;
  done: number;
  notStarted: number;
  inProgress: number;
}

function getTasksStatusCount(tasks: { status: TaskStatus }[]): Readonly<TasksStatusCount> {
  return tasks.reduce<TasksStatusCount>(
    (acc, task) => {
      if (task.status === TaskStatus.Completed) {
        acc.done += 1;
      }

      if (task.status === TaskStatus.Overdue) {
        acc.overdue += 1;
      }

      if (task.status === TaskStatus.NotStarted) {
        acc.notStarted += 1;
      }

      if (task.status === TaskStatus.InProgress) {
        acc.inProgress += 1;
      }

      return acc;
    },
    { done: 0, overdue: 0, total: tasks.length, notStarted: 0, inProgress: 0 },
  );
}

export { getTasksStatusCount };
