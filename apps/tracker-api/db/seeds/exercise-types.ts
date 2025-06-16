import { Kysely } from 'kysely';
import { DB } from '../../src/infrastructure/db';

export default {
  key: 'exercise-types',
  target: 'Типы для упражнений',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      const buffer: { value: string }[] = [];
      for (const value of ['WORM-UP', 'POST-TRAINING', 'AEROBIC', 'ANAEROBIC']) {
        const result = await trx
          .insertInto('exercise_types')
          .values({ value })
          .returning(['value'])
          .executeTakeFirstOrThrow();

        buffer.push(result);
      }

      for (const b of buffer) {
        console.info(`✅ ${b.value} тип упражнения залит успешно`);
      }
    });
  },
};
