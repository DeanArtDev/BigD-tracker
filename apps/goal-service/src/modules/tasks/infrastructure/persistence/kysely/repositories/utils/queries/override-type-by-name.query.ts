import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';
import { TaskOverrideType } from '@big-d/api-contracts';
import { sql } from 'kysely';

function overrideTypeByNameQuery(names: TaskOverrideType[], db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('tasks_recurrences_override_types')
    .where('tasks_recurrences_override_types.name', 'in', names)
    .select(['id', sql<TaskOverrideType>`tasks_recurrences_override_types.name`.as('name')]);
}

export { overrideTypeByNameQuery };
