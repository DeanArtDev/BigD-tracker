import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';

function tasksWithStatusQuery(db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('tasks')
    .innerJoin('task_statuses', 'tasks.status_id', 'task_statuses.id')
    .select(['task_statuses.name as status']);
}

export { tasksWithStatusQuery };
