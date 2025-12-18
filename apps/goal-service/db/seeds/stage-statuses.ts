import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const statuses = [
  { name: 'UPCOMING' },
  { name: 'CANCELED' },
  { name: 'SKIPPED' },
  { name: 'COMPLETED' },
  { name: 'OVERDUE' },
];

export default {
  key: 'stage-statuses',
  target: 'stages',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const status of statuses) {
        await trx
          .insertInto('stage_statuses')
          .values({ name: status.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Stage statuses have beed successfully seeded`);
    });
  },
};
