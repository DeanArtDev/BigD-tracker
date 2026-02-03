import { tasksWithStatusQuery } from '../queries';

function taskWithGroupLinksJoin(joinType: 'innerJoin' | 'leftJoin' = 'innerJoin') {
  return (qb: ReturnType<typeof tasksWithStatusQuery>) => {
    if (joinType === 'innerJoin') {
      return qb.innerJoin('task_to_group', 'task_to_group.task_id', 'tasks.id');
    }

    if (joinType === 'leftJoin') {
      return qb.leftJoin('task_to_group', 'task_to_group.task_id', 'tasks.id');
    }
  };
}

export { taskWithGroupLinksJoin };
