import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';
import { GroupStatus } from '@big-d/api-contracts';
import { sql } from 'kysely';

function groupWithStatusQuery(db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('groups')
    .innerJoin('group_statuses', 'groups.status_id', 'group_statuses.id')
    .select([
      'groups.id as id',
      'groups.user_id as user_id',
      'groups.description as description',
      'groups.name as name',
      'groups.progress as progress',
      sql<GroupStatus>`group_statuses.name`.as('status'),
    ]);
}

export { groupWithStatusQuery };
