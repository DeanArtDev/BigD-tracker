import { DB } from '@/infrastructure/types';
import { INBOX_GROUP_KEY } from '@/modules/tasks/application/ports';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { Transaction } from 'kysely';

async function getInboxByUserId(
  db: Database<DB>,
  input: { userId: number },
  trx?: Transaction<DB>,
) {
  const inbox = await db
    .qb(trx)
    .selectFrom('groups as g')
    .leftJoin('task_to_group as ttg', 'ttg.group_id', 'g.id')
    .leftJoin('tasks as t', 't.id', 'ttg.task_id')
    .leftJoin('task_statuses as ts', 'ts.id', 't.status_id')
    .where('g.name', '=', INBOX_GROUP_KEY)
    .where('g.user_id', '=', input.userId)
    .select(['g.id as id', 'g.user_id as user_id', 'g.name as name'])
    .executeTakeFirst();
  if (inbox == null) return null;

  return inbox;
}

export { getInboxByUserId };
