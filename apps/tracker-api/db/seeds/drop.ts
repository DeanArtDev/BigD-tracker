import { Kysely } from 'kysely';

export default {
  key: 'drop',
  target: 'Дроп таблиц',
  seed: async (db: Kysely<any>) => {
    await db.transaction().execute(async (trx) => {
      const tables = [
        'exercises',
        'trainings',
        'exercise_types',
        'trainings_types',
        'trainings_templates',
        'repetitions_types',
        'users',
      ];

      await Promise.all([
        tables.map(async (table) => {
          await trx.deleteFrom(table).execute();
        }),
      ]);

      for (const b of tables) {
        console.info(`✅ ${b} ДРОПНУТА успешно`);
      }
    });
  },
};
