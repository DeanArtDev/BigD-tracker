import { AuthDatabase, AuthTransaction } from '@/modules/auth/application/ports';
import { UserType } from '@big-d/api-contracts';
import { sql } from 'kysely';

function taskRecurrencesQuery(db: AuthDatabase, trx?: AuthTransaction) {
  return db
    .qb(trx)
    .selectFrom('users')
    .innerJoin('user_types', 'users.type_id', 'user_types.id')
    .select([
      'users.id as id',
      'users.email as email',
      'users.password_hash as password_hash',
      'users.avatar as avatar',
      'users.screen_name as screen_name',
      sql<UserType>`user_types.name`.as('type'),
    ]);
}

export { taskRecurrencesQuery };
