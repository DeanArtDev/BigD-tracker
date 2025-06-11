import { OmitCreateFields, Override } from '@shared/lib/type-helpers';
import { ExerciseEntity } from '../domain/exercise.entity';
import { DB } from '@shared/modules/db';
import { Insertable, Selectable, Updateable } from 'kysely/dist/esm';

interface ExerciseRawData {
  readonly selectable: Omit<Selectable<DB['exercises']>, 'updated_at' | 'created_at'>;
  readonly updateable: Omit<
    Override<Updateable<DB['exercises']>, 'id', number>,
    'updated_at' | 'created_at'
  >;
  readonly insertable: OmitCreateFields<Insertable<DB['exercises']>>;
}

interface ExercisesRepository {
  findOneById: (id: number) => Promise<ExerciseEntity | null>;
  findAllByIds(ids: number[]): Promise<ExerciseEntity[]>;
  findAllByFilters(filters: { userId: number; my?: boolean }): Promise<ExerciseEntity[]>;
  create(data: ExerciseRawData['insertable']): Promise<ExerciseEntity | null>;
  update: (
    data: ExerciseRawData['updateable'],
    options?: { replace: boolean },
  ) => Promise<ExerciseEntity | null>;
  delete(id: number): Promise<boolean>;
}

enum ExerciseType {
  'WORM-UP' = 'WORM-UP',
  'POST-TRAINING' = 'POST-TRAINING',
  'AEROBIC' = 'AEROBIC',
  'ANAEROBIC' = 'ANAEROBIC',
}

const EXERCISE_REPOSITORY = Symbol('EXERCISE_REPOSITORY');

export { ExerciseType, EXERCISE_REPOSITORY, ExercisesRepository, ExerciseRawData };
