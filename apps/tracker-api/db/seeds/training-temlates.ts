import { Kysely } from 'kysely';
import { DB } from '../../src/shared/modules/db/types';

const trainings = [
  {
    type: 'LIGHT',
    name: 'Общая тренировка груди',
    description: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
    worm_up_duration: 30,
    exercises: [
      {
        id: 1,
        sets: 3,
        repetitions: 12,
      },
    ],
  },
  {
    type: 'MEDIUM',
    name: 'Общая тренировка спины',
    description: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
    worm_up_duration: 30,
    post_training_duration: 30,
    exercises: [
      {
        id: 1,
        sets: 3,
        repetitions: 6,
      },
    ],
  },
  {
    type: 'HARD',
    name: 'Общая тренировка ног',
    description: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
    post_training_duration: 30,
    exercises: [
      {
        id: 1,
        sets: 3,
        repetitions: 3,
      },
    ],
  },
];

export default {
  key: 'training-templates',
  target: 'Общие для всех шаблоны тренировок',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const { exercises, ...training } of trainings) {
        const result = await trx
          .insertInto('trainings_templates')
          .values(training)
          .returning(['id'])
          .executeTakeFirstOrThrow();

        await trx
          .insertInto('training_templates_exercise_templates')
          .values(
            exercises.map((i, index) => ({
              training_template_id: result.id,
              exercise_template_id: i.id,
              order: index,
            })),
          )
          .executeTakeFirstOrThrow();
      }

      for (const t of trainings) {
        console.log(`✅ ${t.name} залита успешно`);
      }
    });
  },
};
