import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const goalStatuses = [
  { name: 'NOT_STARTED' },
  { name: 'IN_PROGRESS' },
  { name: 'COMPLETED' },
  { name: 'OVERDUE' },
  { name: 'CANCELED' },
  { name: 'ARCHIVED' },
  { name: 'DELETED' },
];

export default {
  key: 'goal-statuses',
  target: 'goals',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const goalStatus of goalStatuses) {
        await trx
          .insertInto('goal_statuses')
          .values({ name: goalStatus.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Goals statuses have beed successfully seeded`);
    });
  },
};
