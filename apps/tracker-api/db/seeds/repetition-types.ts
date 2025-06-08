import { Kysely } from 'kysely';
import { DB } from '../../src/shared/modules/db/types';

export default {
  key: 'repetition-types',
  target: 'Типы для повторений',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      const buffer: { value: string }[] = [];
      for (const value of ['DONE', 'SKIP', 'TRIED', 'OVER']) {
        const result = await trx
          .insertInto('repetitions_types')
          .values({ value })
          .returning(['value'])
          .executeTakeFirstOrThrow();

        buffer.push(result);
      }

      for (const b of buffer) {
        console.log(`✅ ${b.value} тип повторения залит успешно`);
      }
    });
  },
};
