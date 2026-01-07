import { DB } from '@/infrastructure/types';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { Transaction } from 'kysely';

async function isGroupExists(
  db: Database<DB>,
  input: { groupId: number } | { name: string },
  trx?: Transaction<DB>,
): Promise<boolean> {
  const query = db.qb(trx).selectFrom('groups');
  'groupId' in input ? query.where('id', '=', input.groupId) : query.where('name', '=', input.name);
  const result = await query.executeTakeFirst();

  return result != null;
}

export { isGroupExists };
