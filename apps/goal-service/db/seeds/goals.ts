import { Kysely } from 'kysely';

export default {
  key: 'goals',
  target: 'Цели',
  seed: async (db: Kysely<any>) => {
    await db.transaction().execute(async (trx) => {
      await trx
        .insertInto('goals')
        .values({
          name: 'Имя цели',
          position: 0,
          description: 'Описание',
          user_id: 1,
          result: 0,
        })
        .executeTakeFirstOrThrow();

      console.info(`✅ Цели залиты успешно`);
    });
  },
};
