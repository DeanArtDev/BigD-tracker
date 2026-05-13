import { AuthDatabase, AuthTransaction } from '@/modules/auth/application/ports';
import { UserType } from '@big-d/api-contracts';
import { sql } from 'kysely';

function userTypeByNameQuery(names: UserType[], db: AuthDatabase, trx?: AuthTransaction) {
  return db
    .qb(trx)
    .selectFrom('user_types')
    .where('user_types.name', 'in', names)
    .select(['id', sql<UserType>`user_types.name`.as('name')]);
}

export { userTypeByNameQuery };
