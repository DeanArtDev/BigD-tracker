import { tasksWithStatusQuery } from '../queries';

function leftJoinGroupLinks(db: ReturnType<typeof tasksWithStatusQuery>) {
  return db
    .leftJoin('task_to_group', 'task_to_group.task_id', 'tasks.id')
    .select([
      'task_to_group.group_id as group_id',
      'task_to_group.task_id as group_task_id',
      'task_to_group.position as position',
    ]);
}

export { leftJoinGroupLinks };
