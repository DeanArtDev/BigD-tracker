import { Kysely } from 'kysely';
import { DB } from '../../src/infrastructure/db';

const trainings = [
  {
    type: 'LIGHT',
    name: 'Общая тренировка груди',
    description: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
    worm_up_duration: 30,
  },
  {
    type: 'MEDIUM',
    name: 'Общая тренировка спины',
    description: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
    worm_up_duration: 30,
    post_training_duration: 30,
  },
  {
    type: 'HARD',
    name: 'Общая тренировка ног',
    description: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
    post_training_duration: 30,
  },
];

const exercises = [
  {
    type: 'ANAEROBIC',
    name: 'Упражнение для шаблона тренировок',
    description: 'Описание упражнения',
    example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
    position: 0,
  },
  {
    type: 'ANAEROBIC',
    name: 'Упражнение для шаблона тренировок',
    description: 'Описание упражнения',
    example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
    position: 1,
  },
  {
    type: 'ANAEROBIC',
    name: 'Упражнение для шаблона тренировок',
    description: 'Описание упражнения',
    example_url: 'https://www.youtube.com/watch?v=Lo6KK-PY-Ps&pp=0gcJCbIJAYcqIYzv',
    position: 2,
  },
];

export default {
  key: 'training-templates',
  target: 'Общие для всех шаблоны тренировок',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('trainings_templates').execute();

      for (const training of trainings) {
        const template = await trx
          .insertInto('trainings_templates')
          .values(training)
          .returning(['id'])
          .executeTakeFirstOrThrow();

        for (const exercise of exercises) {
          const { id: exerciseId } = await trx
            .insertInto('exercises')
            .values({ ...exercise, training_template_id: template.id })
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
                exercise_id: exerciseId,
              },
              {
                user_id: 1,
                target_break: 3,
                target_count: 12,
                target_weight: '25.5',
                position: 1,
                created_at: new Date(),
                exercise_id: exerciseId,
              },
              {
                user_id: 1,
                target_break: 3,
                target_count: 12,
                target_weight: '25.5',
                position: 2,
                created_at: new Date(),
                exercise_id: exerciseId,
              },
            ])
            .executeTakeFirstOrThrow();
        }
      }

      for (const t of trainings) {
        console.info(`✅ ${t.name} залита успешно`);
      }
    });
  },
};
