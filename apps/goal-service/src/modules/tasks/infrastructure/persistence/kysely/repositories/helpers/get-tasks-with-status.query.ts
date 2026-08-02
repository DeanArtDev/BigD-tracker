import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';

function getTasksWithStatusQuery(db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('tasks as t')
    .innerJoin('task_statuses as ts', 't.status_id', 'ts.id')
    .select([
      't.id as id',
      't.user_id as user_id',
      't.name as name',
      't.description as description',
      't.priority as priority',
      't.cancel_reason as cancel_reason',
      't.start_date as start_date',
      't.end_date as end_date',
      't.deadline as deadline',
      'ts.name as status',
    ]);
}

export { getTasksWithStatusQuery };
