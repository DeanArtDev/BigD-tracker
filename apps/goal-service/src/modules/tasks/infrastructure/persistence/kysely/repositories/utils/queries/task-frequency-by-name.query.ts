import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';
import { RecurrenceFrequency } from '@big-d/api-contracts';
import { sql } from 'kysely';

function taskFrequencyByNameQuery(
  names: (keyof typeof RecurrenceFrequency)[],
  db: TaskDatabase,
  trx?: TaskTransaction,
) {
  return db
    .qb(trx)
    .selectFrom('recurrences_frequencies')
    .where('recurrences_frequencies.name', 'in', names)
    .select(['id', sql<keyof typeof RecurrenceFrequency>`recurrences_frequencies.name`.as('name')]);
}

export { taskFrequencyByNameQuery };
