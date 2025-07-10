import { Kysely } from 'kysely';
import { DB } from '../../src/infrastructure/types';

export default {
  key: 'exercise-types',
  target: 'Типы для упражнений',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      const list = ['WORM-UP', 'POST-TRAINING', 'AEROBIC', 'ANAEROBIC'];
      const existedList = await trx.selectFrom('exercise_types').selectAll().execute();

      if (existedList.length === list.length) {
        console.info(`✅ Типы упражнений уже залиты`);
        return;
      }

      const buffer: { value: string }[] = [];
      for (const value of list) {
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
