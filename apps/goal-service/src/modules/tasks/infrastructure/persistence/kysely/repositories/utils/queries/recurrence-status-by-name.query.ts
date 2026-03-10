import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';
import { TaskRecurrenceStatus } from '@big-d/api-contracts';
import { sql } from 'kysely';

function recurrenceStatusByNameQuery(names: TaskRecurrenceStatus[], db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('recurrence_statuses')
    .where('recurrence_statuses.name', 'in', names)
    .select(['id', sql<TaskRecurrenceStatus>`recurrence_statuses.name`.as('name')]);
}

export { recurrenceStatusByNameQuery };
