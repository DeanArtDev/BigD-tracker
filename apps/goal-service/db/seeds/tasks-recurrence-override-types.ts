import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const overrideTypes = [
  { name: 'OVERRIDE' },
  { name: 'CANCELED' },
  { name: 'DELETED' },
  { name: 'MOVED' },
  { name: 'ARCHIVED' },
];

export default {
  key: 'task_recurrence_override_types',
  target: 'tasks_recurrence_override_types',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const type of overrideTypes) {
        await trx
          .insertInto('tasks_recurrence_override_types')
          .values({ name: type.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Task override types have beed successfully seeded`);
    });
  },
};
