import { Kysely } from 'kysely';

export default {
  key: 'groups',
  target: 'Группы дел',
  seed: async (db: Kysely<any>) => {
    await db.transaction().execute(async (trx) => {
      await trx
        .insertInto('groups')
        .values({
          name: 'IN BOX',
          position: 0,
          user_id: 1,
        })
        .executeTakeFirstOrThrow();

      console.info(`✅ Группа IN BOX залита успешно`);
    });
  },
};
