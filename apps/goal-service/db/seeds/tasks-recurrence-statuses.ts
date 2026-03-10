import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const recurrenceStatuses = [{ name: 'ACTIVE' }, { name: 'CANCELED' }];

export default {
  key: 'recurrence_statuses',
  target: 'recurrence_statuses',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const type of recurrenceStatuses) {
        await trx
          .insertInto('recurrence_statuses')
          .values({ name: type.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Task recurrence statuses have beed successfully seeded`);
    });
  },
};
