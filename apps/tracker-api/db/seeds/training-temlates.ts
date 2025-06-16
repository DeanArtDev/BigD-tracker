import { Kysely } from 'kysely';
import { DB } from '../../src/infrastructure/db';

const trainings = [
  {
    type: 'LIGHT',
    name: 'Общая тренировка груди',
    description: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
    worm_up_duration: 30,
    exercises: [
      {
        id: 4,
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
        id: 5,
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
        id: 6,
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

        await Promise.all(
          exercises.map(async (exercise) => {
            return await trx
              .updateTable('exercises')
              .where('id', '=', exercise.id)
              .set({
                training_template_id: result.id,
              })
              .executeTakeFirstOrThrow();
          }),
        );
      }

      for (const t of trainings) {
        console.info(`✅ ${t.name} залита успешно`);
      }
    });
  },
};
