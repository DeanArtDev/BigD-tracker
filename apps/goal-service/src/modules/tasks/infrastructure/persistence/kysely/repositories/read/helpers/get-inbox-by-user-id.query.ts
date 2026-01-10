import { DB } from '@/infrastructure/types';
import { INBOX_GROUP_KEY } from '@/modules/tasks/application/ports';
import { Database } from '@/modules/tasks/application/ports';
import { Transaction } from 'kysely';

function getInboxByUserIdQuery(db: Database<DB>, input: { userId: number }, trx?: Transaction<DB>) {
  return db
    .qb(trx)
    .selectFrom('groups as g')
    .leftJoin('task_to_group as ttg', 'ttg.group_id', 'g.id')
    .where('g.name', '=', INBOX_GROUP_KEY)
    .where('g.user_id', '=', input.userId)
    .select(['g.id as id', 'g.user_id as user_id', 'g.name as name']);
}

export { getInboxByUserIdQuery };
