import { type TaskEntity, TaskStatus } from '@/entity/planner/tasks';

interface TasksStatusCount {
  total: number;
  overdue: number;
  done: number;
  notStarted: number;
}

function getTasksStatusCount(
  tasks: { status: TaskEntity['status'] }[],
): Readonly<TasksStatusCount> {
  return tasks.reduce<TasksStatusCount>(
    (acc, task) => {
      if (task.status === TaskStatus.COMPLETED) {
        acc.done += 1;
      }

      if (task.status === TaskStatus.OVERDUE) {
        acc.overdue += 1;
      }

      if (task.status === TaskStatus.NOT_STARTED) {
        acc.notStarted += 1;
      }

      return acc;
    },
    { done: 0, overdue: 0, total: tasks.length, notStarted: 0 },
  );
}

export { getTasksStatusCount };
