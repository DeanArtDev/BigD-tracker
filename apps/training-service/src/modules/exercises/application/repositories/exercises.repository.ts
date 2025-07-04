import { ExerciseEntity } from '@modules/exercises/domain';
import { OmitCreateFields, Override } from '@big-d/api-utils';
import { DB } from '@big-d/database';
import { Insertable, Selectable, Transaction, Updateable } from 'kysely';

interface ExerciseRawData {
  readonly selectable: Omit<Selectable<DB['exercises']>, 'updated_at' | 'created_at'>;
  readonly updateable: Omit<
    Override<Updateable<DB['exercises']>, 'id', number>,
    'updated_at' | 'created_at'
  >;
  readonly insertable: OmitCreateFields<Override<Insertable<DB['exercises']>, 'position', number>>;
}

interface ExercisesRepository {
  findOneById: (id: number, trx?: Transaction<DB>) => Promise<ExerciseEntity | null>;

  findAllByIds(ids: number[], trx?: Transaction<DB>): Promise<ExerciseEntity[]>;

  findAllByFilters(
    filters: {
      userId?: number;
      trainingId?: number;
      templateId?: number;
      positionOrder?: 'asc' | 'desc';
    },
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
    options: { replace: boolean },
    trx?: Transaction<DB>,
  ): Promise<ExerciseEntity | null>;

  delete(id: number, trx?: Transaction<DB>): Promise<boolean>;
}

const EXERCISE_REPOSITORY = Symbol('EXERCISE_REPOSITORY');

export { EXERCISE_REPOSITORY, ExercisesRepository, ExerciseRawData };
