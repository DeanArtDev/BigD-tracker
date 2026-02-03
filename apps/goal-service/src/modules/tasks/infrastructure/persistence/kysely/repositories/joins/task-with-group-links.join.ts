import { tasksWithStatusQuery } from '../queries';

function taskWithGroupLinksJoin(qb: ReturnType<typeof tasksWithStatusQuery>) {
  return qb.innerJoin('task_to_group', 'task_to_group.task_id', 'tasks.id');
}

export { taskWithGroupLinksJoin };
