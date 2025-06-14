import { OmitCreateFields, Override } from '@shared/lib/type-helpers';
import { ExerciseEntity } from '../../domain/exercise.entity';
import { DB } from '@/infrastructure/db';
import { Insertable, Selectable, Transaction, Updateable } from 'kysely';

interface ExerciseRawData {
  readonly selectable: Omit<Selectable<DB['exercises']>, 'updated_at' | 'created_at'>;
  readonly updateable: Omit<
    Override<Updateable<DB['exercises']>, 'id', number>,
    'updated_at' | 'created_at'
  >;
  readonly insertable: OmitCreateFields<Insertable<DB['exercises']>>;
}

interface ExercisesRepository {
  findOneById: (id: number, trx?: Transaction<DB>) => Promise<ExerciseEntity | null>;

  findAllByIds(ids: number[], trx?: Transaction<DB>): Promise<ExerciseEntity[]>;

  findAllByFilters(
    filters: { userId?: number; trainingId?: number; templateId?: number },
    trx?: Transaction<DB>,
  ): Promise<ExerciseEntity[]>;

  findTemplatable(
    filters: { userId?: number; onlyUser?: boolean },
    trx?: Transaction<DB>,
  ): Promise<ExerciseEntity[]>;

  create(
    data: ExerciseRawData['insertable'],
    trx?: Transaction<DB>,
  ): Promise<ExerciseEntity | null>;

  update: (
    data: ExerciseRawData['updateable'],
    options?: { replace: boolean },
  ) => Promise<ExerciseEntity | null>;

  upsert(
    input: ExerciseRawData['insertable'] & { id: number },
    trx?: Transaction<DB>,
  ): Promise<ExerciseEntity | null>;

  delete(id: number, trx?: Transaction<DB>): Promise<boolean>;
}

enum ExerciseType {
  'WORM-UP' = 'WORM-UP',
  'POST-TRAINING' = 'POST-TRAINING',
  'AEROBIC' = 'AEROBIC',
  'ANAEROBIC' = 'ANAEROBIC',
}

const EXERCISE_REPOSITORY = Symbol('EXERCISE_REPOSITORY');

export { ExerciseType, EXERCISE_REPOSITORY, ExercisesRepository, ExerciseRawData };
