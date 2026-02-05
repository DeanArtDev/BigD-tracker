import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';

function tasksWithStatusQuery(db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('tasks')
    .innerJoin('task_statuses', 'tasks.status_id', 'task_statuses.id')
    .select([
      'tasks.id as id',
      'tasks.user_id as user_id',
      'tasks.name as name',
      'tasks.description as description',
      'tasks.priority as priority',
      'tasks.weight as weight',
      'tasks.cancel_reason as cancel_reason',
      'tasks.start_date as start_date',
      'tasks.end_date as end_date',
      'tasks.deadline as deadline',
      'tasks.recurrence as recurrence',
      'task_statuses.name as status',
    ]);
}

export { tasksWithStatusQuery };
