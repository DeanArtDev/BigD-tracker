import { Kysely } from 'kysely';
import { DB } from '../../src/shared/modules/db/types';

export default {
  key: 'exercise-templates',
  target: 'Шаблоны упражнений',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('exercises_templates').execute();

      await trx
        .insertInto('exercises_templates')
        .values({
          type: 'ANAEROBIC',
          name: 'Общее упражнение для тренировок',
          description: 'Описание упражнения',
          example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      console.log(`✅ Шаблоны упражнений залиты успешно`);
    });
  },
};
