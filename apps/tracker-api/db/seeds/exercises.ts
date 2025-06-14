import { Kysely } from 'kysely';
import { DB } from '../../src/infrastructure/db';

export default {
  key: 'exercise',
  target: 'Упражнения',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('exercises').execute();

      await trx
        .insertInto('exercises')
        .values([
          {
            type: 'ANAEROBIC',
            name: 'Упражнение для тренировок',
            description: 'Описание упражнения',
            example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          },
          {
            type: 'ANAEROBIC',
            name: 'Упражнение для тренировок',
            description: 'Описание упражнения',
            example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          },
          {
            type: 'ANAEROBIC',
            name: 'Упражнение для тренировок',
            description: 'Описание упражнения',
            example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          },

          {
            type: 'ANAEROBIC',
            name: 'Упражнение для шаблона тренировок',
            description: 'Описание упражнения',
            example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          },
          {
            type: 'ANAEROBIC',
            name: 'Упражнение для шаблона тренировок',
            description: 'Описание упражнения',
            example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          },
          {
            type: 'ANAEROBIC',
            name: 'Упражнение для шаблона тренировок',
            description: 'Описание упражнения',
            example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          },

          {
            type: 'ANAEROBIC',
            name: 'Общие шаблонные упражнение',
            description: 'Описание упражнения',
            example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          },
          {
            type: 'ANAEROBIC',
            name: 'Общие шаблонные упражнение',
            description: 'Описание упражнения',
            example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          },
          {
            type: 'ANAEROBIC',
            name: 'Общие шаблонные упражнение',
            description: 'Описание упражнения',
            example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          },
        ])
        .returningAll()
        .executeTakeFirstOrThrow();

      console.info(`✅ Шаблоны упражнений залиты успешно`);
    });
  },
};
