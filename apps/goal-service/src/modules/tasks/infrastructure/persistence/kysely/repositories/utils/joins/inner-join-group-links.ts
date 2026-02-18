import { tasksWithStatusQuery } from '../queries';

function innerJoinGroupLinks(db: ReturnType<typeof tasksWithStatusQuery>) {
  return db
    .innerJoin('task_to_group', 'task_to_group.task_id', 'tasks.id')
    .select(['task_to_group.group_id as group_id']);
}

export { innerJoinGroupLinks };
