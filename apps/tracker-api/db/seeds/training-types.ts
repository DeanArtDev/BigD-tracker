import { Kysely } from 'kysely';
import { DB } from '../../src/shared/modules/db/types';

export default {
  key: 'training-types',
  target: 'Типы для тренировок',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      const buffer: { value: string }[] = [];
      for (const value of ['LIGHT', 'MEDIUM', 'HARD', 'MIXED']) {
        const result = await trx
          .insertInto('trainings_types')
          .values({ value })
          .returning(['value'])
          .executeTakeFirstOrThrow();
        if (result != null) buffer.push(result);
      }

      for (const b of buffer) {
        console.info(`✅ ${b.value} тип тренировки залит успешно`);
      }
    });
  },
};
