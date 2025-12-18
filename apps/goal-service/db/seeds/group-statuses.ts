import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const statuses = [{ name: 'NOT_STARTED' }, { name: 'IN_PROGRESS' }, { name: 'DONE' }];

export default {
  key: 'group-statuses',
  target: 'groups',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const status of statuses) {
        await trx
          .insertInto('group_statuses')
          .values({ name: status.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Group statuses have beed successfully seeded`);
    });
  },
};
