import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const types = [{ name: 'START' }, { name: 'VALIDATION' }, { name: 'END' }];

export default {
  key: 'stage-types',
  target: 'stages',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const type of types) {
        await trx
          .insertInto('stage_types')
          .values({ name: type.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Stage types have beed successfully seeded`);
    });
  },
};
