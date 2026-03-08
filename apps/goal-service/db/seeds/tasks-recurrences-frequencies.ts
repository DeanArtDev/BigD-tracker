import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const recurrencesFrequencies = [{ name: 'DAILY' }, { name: 'WEEKLY' }, { name: 'MONTHLY' }, { name: 'YEARLY' }];

export default {
  key: 'tasks-recurrences-frequencies',
  target: 'recurrences_frequencies',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const freq of recurrencesFrequencies) {
        await trx
          .insertInto('recurrences_frequencies')
          .values({ name: freq.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Recurrences frequencies have beed successfully seeded`);
    });
  },
};
