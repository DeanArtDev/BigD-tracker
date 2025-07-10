import { Kysely } from 'kysely';
import { DB } from '../../src/infrastructure/types';

export default {
  key: 'exercise',
  target: 'Упражнения',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('exercises').execute();

      const list = [
        {
          type: 'ANAEROBIC',
          name: 'Первое общее упражнение для тренировок',
          description: 'Описание упражнения',
          example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          position: 0,
        },
        {
          type: 'AEROBIC',
          name: 'Второе общее упражнение для тренировок',
          description: 'Описание упражнения',
          example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          position: 1,
        },
        {
          type: 'ANAEROBIC',
          name: 'Третье общее упражнение для тренировок',
          description: 'Описание упражнения',
          example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
          position: 2,
        },
      ];

      for (const listElement of list) {
        const { id } = await trx
          .insertInto('exercises')
          .values(listElement)
          .returning(['id'])
          .executeTakeFirstOrThrow();

        await trx
          .insertInto('repetitions')
          .values([
            {
              user_id: 1,
              target_break: 3,
              target_count: 12,
              target_weight: '25.5',
              position: 0,
              created_at: new Date(),
              updated_at: new Date(),
              exercise_id: id,
            },
            {
              user_id: 1,
              target_break: 3,
              target_count: 12,
              target_weight: '25.5',
              position: 1,
              created_at: new Date(),
              updated_at: new Date(),
              exercise_id: id,
            },
            {
              user_id: 1,
              target_break: 3,
              target_count: 12,
              target_weight: '25.5',
              position: 2,
              created_at: new Date(),
              updated_at: new Date(),
              exercise_id: id,
            },
          ])
          .executeTakeFirstOrThrow();
      }

      console.info(`✅ Шаблоны упражнений залиты успешно`);
    });
  },
};
