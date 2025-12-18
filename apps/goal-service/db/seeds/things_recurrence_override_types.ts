import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const thingStatuses = [
  { name: 'OVERRIDE' },
  { name: 'CANCELED' },
  { name: 'DELETED' },
  { name: 'MOVED' },
  { name: 'ARCHIVED' },
];

export default {
  key: 'things_recurrence_override_types',
  target: 'things_recurrence_override',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const status of thingStatuses) {
        await trx
          .insertInto('things_recurrence_override_types')
          .values({ name: status.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Thing override types have beed successfully seeded`);
    });
  },
};
