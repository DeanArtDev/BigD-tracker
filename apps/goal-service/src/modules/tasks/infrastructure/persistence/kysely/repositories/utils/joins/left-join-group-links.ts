import { tasksWithStatusQuery } from '../queries';

function leftJoinGroupLinks(db: ReturnType<typeof tasksWithStatusQuery>) {
  return db
    .leftJoin('task_to_group', 'task_to_group.task_id', 'tasks.id')
    .select(['task_to_group.group_id as group_id']);
}

export { leftJoinGroupLinks };
