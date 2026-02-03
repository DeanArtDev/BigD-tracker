import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';
import { TaskStatus } from '@big-d/api-contracts';

function statusByNameQuery(names: TaskStatus[], db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('task_statuses')
    .where('task_statuses.name', 'in', names)
    .selectAll();
}

export { statusByNameQuery };
