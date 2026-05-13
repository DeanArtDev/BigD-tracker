import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const taskStatuses = [{ name: 'NOT_VERIFIED' }, { name: 'VERIFIED' }, { name: 'SUSPICIOUS' }, { name: 'FRAUD' }];

export default {
  key: 'user-types',
  target: 'users',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const status of taskStatuses) {
        await trx
          .insertInto('user_types')
          .values({ name: status.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Tasks statuses have beed successfully seeded`);
    });
  },
};
