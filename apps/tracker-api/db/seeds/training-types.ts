import { Kysely } from 'kysely';
import { DB } from '../../src/infrastructure/db';

export default {
  key: 'training-types',
  target: 'Типы для тренировок',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      const list = ['LIGHT', 'MEDIUM', 'HARD', 'MIXED'];
      const existedList = await trx.selectFrom('trainings_types').selectAll().execute();

      if (existedList.length === list.length) {
        console.info(`✅ Типы тренировок уже залиты`);
        return;
      }

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
