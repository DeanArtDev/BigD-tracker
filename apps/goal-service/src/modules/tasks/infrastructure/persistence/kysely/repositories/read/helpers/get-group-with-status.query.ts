import { DB } from '@/infrastructure/types';
import { Database } from '@/modules/tasks/application/ports';
import { Transaction } from 'kysely';

function getGroupWithStatusQuery(db: Database<DB>, trx?: Transaction<DB>) {
  return db
    .qb(trx)
    .selectFrom('groups as g')
    .innerJoin('group_statuses as gs', 'g.status_id', 'gs.id')
    .select([
      'g.id as id',
      'g.user_id as user_id',
      'g.description as description',
      'g.name as name',
      'gs.name as status',
      'g.progress as progress',
    ]);
}

export { getGroupWithStatusQuery };
