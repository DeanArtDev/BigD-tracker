import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const taskStatuses = [
  { name: 'NOT_STARTED' },
  { name: 'IN_PROGRESS' },
  { name: 'COMPLETED' },
  { name: 'OVERDUE' },
  { name: 'CANCELED' },
  { name: 'ARCHIVED' },
  { name: 'DELETED' },
];

export default {
  key: 'task-statuses',
  target: 'tasks',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const status of taskStatuses) {
        await trx
          .insertInto('task_statuses')
          .values({ name: status.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Tasks statuses have beed successfully seeded`);
    });
  },
};
