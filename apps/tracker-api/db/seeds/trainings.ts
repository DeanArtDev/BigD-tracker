import { Kysely } from 'kysely';
import { DB } from '../../src/infrastructure/db';

const trainings = [
  {
    type: 'LIGHT',
    name: 'Моя тренировка груди',
    description: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
    worm_up_duration: 30,
    user_id: 1,
    start_date: '2025-05-24T13:01:02.471Z',
    exercises: [
      {
        id: 1,
      },
    ],
  },
  {
    type: 'MEDIUM',
    user_id: 1,
    start_date: '2025-05-24T13:01:02.471Z',
    name: 'Моя тренировка спины',
    description: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
    worm_up_duration: 30,
    post_training_duration: 30,
    exercises: [
      {
        id: 2,
      },
    ],
  },
  {
    type: 'HARD',
    user_id: 1,
    start_date: '2025-05-24T13:01:02.471Z',
    name: 'Моя тренировка ног',
    description: 'описание (какие цели на тренировку, на что сделать упор и т.п)',
    post_training_duration: 30,
    exercises: [
      {
        id: 3,
      },
    ],
  },
];

export default {
  key: 'training',
  target: 'Тренировки пользователя',
  seed: async (db: Kysely<DB>) => {
    await db.transaction().execute(async (trx) => {
      for (const { exercises, ...training } of trainings) {
        const result = await trx
          .insertInto('trainings')
          .values(training)
          .returning(['id'])
          .executeTakeFirstOrThrow();

        await Promise.all(
          exercises.map(async (exercise) => {
            return await trx
              .updateTable('exercises')
              .where('id', '=', exercise.id)
              .set({
                training_id: result.id,
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
