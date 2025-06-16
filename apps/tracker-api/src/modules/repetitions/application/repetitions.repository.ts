import { OmitCreateFields, Override } from '@shared/lib/type-helpers';
import { DB } from '@/infrastructure/db';
import { Insertable, Selectable, Transaction, Updateable } from 'kysely';
import { RepetitionEntity } from '../domain/repetition.entity';

interface RepetitionsRepository {
  createMany(
    data: RepetitionRawData['insertable'][],
    trx?: Transaction<DB>,
  ): Promise<RepetitionEntity[]>;

  update(
    data: RepetitionRawData['updateable'],
    trx?: Transaction<DB>,
  ): Promise<RepetitionEntity | null>;

  findAllByFilters(
    filters: {
      exerciseId?: number;
      userId?: number | null;
    },
    trx?: Transaction<DB>,
  ): Promise<RepetitionEntity[]>;

  findOneById(id: number, trx?: Transaction<DB>): Promise<RepetitionEntity | null>;

  findTemplatables(trx?: Transaction<DB>): Promise<RepetitionEntity[]>;

  deleteMany(ids: number[], trx?: Transaction<DB>): Promise<number>;

  deleteByExerciseIds(ids: number[], trx?: Transaction<DB>): Promise<number>;
}

interface RepetitionRawData {
  readonly selectable: Omit<Selectable<DB['repetitions']>, 'created_at' | 'updated_at'>;
  readonly updateable: Omit<
    Override<Updateable<DB['repetitions']>, 'id', number>,
    'created_at' | 'updated_at'
  >;
  readonly insertable: OmitCreateFields<Insertable<DB['repetitions']>>;
}

enum RepetitionFinishType {
  DONE = 'DONE',
  SKIP = 'SKIP',
  TRIED = 'TRIED',
  OVER = 'OVER',
}

const REPETITIONS_REPOSITORY = Symbol('REPETITIONS_REPOSITORY');

export { REPETITIONS_REPOSITORY, RepetitionFinishType, RepetitionsRepository, RepetitionRawData };
