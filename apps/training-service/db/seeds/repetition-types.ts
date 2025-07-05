import { Kysely } from 'kysely';
import { DB } from '@big-d/database';

export default {
  key: 'repetition-types',
  target: 'Типы для повторений',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      const list = ['DONE', 'SKIP', 'TRIED', 'OVER'];
      const existedList = await trx.selectFrom('repetitions_types').selectAll().execute();

      if (existedList.length === list.length) {
        console.info(`✅ Типы повторений уже залиты`);
        return;
      }

      const buffer: { value: string }[] = [];
      for (const value of list) {
        const result = await trx
          .insertInto('repetitions_types')
          .values({ value })
          .returning(['value'])
          .executeTakeFirstOrThrow();

        buffer.push(result);
      }

      for (const b of buffer) {
        console.info(`✅ ${b.value} тип повторения залит успешно`);
      }
    });
  },
};
