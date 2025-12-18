import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const thingStatuses = [
  { name: 'NOT_STARTED' },
  { name: 'IN_PROGRESS' },
  { name: 'COMPLETED' },
  { name: 'OVERDUE' },
  { name: 'CANCELED' },
  { name: 'ARCHIVED' },
  { name: 'DELETED' },
];

export default {
  key: 'thing-statuses',
  target: 'things',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const status of thingStatuses) {
        await trx
          .insertInto('thing_statuses')
          .values({ name: status.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Thing statuses have beed successfully seeded`);
    });
  },
};
