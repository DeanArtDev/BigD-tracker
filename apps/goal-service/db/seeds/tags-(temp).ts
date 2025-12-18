import { DB } from '../../src/infrastructure/types';
import { Kysely } from 'kysely';

const tags = [{ name: 'test-tag' }];

export default {
  key: 'tags',
  target: 'tags',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const tag of tags) {
        await trx
          .insertInto('tags')
          .values({ name: tag.name })
          .onConflict((oc) => oc.column('name').doNothing())
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Stage types have beed successfully seeded`);
    });
  },
};
