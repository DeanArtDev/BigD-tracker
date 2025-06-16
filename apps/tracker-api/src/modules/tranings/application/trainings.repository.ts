import { DB } from '@/infrastructure/db';
import { OmitCreateFields, Override } from '@shared/lib/type-helpers';
import { Insertable, Selectable, Transaction, Updateable } from 'kysely';
import { TrainingEntity } from '../domain/entities/training.entity';

interface TrainingRawData {
  readonly selectable: Omit<Selectable<DB['trainings']>, 'updated_at' | 'created_at'>;
  readonly updateable: Omit<
    Override<Updateable<DB['trainings']>, 'id', number>,
    'updated_at' | 'created_at'
  >;
  readonly insertable: OmitCreateFields<Insertable<DB['trainings']>>;
}

interface TrainingsRepository {
  findOneById(data: { id: number }, trx?: Transaction<DB>): Promise<TrainingEntity | null>;
  find(
    data: {
      userId?: number | null;
      from?: string;
      to?: string;
    },
    trx?: Transaction<DB>,
  ): Promise<TrainingEntity[]>;
  create(
    data: TrainingRawData['insertable'],
    trx?: Transaction<DB>,
  ): Promise<TrainingEntity | null>;
  update(
    data: TrainingRawData['updateable'],
    options?: { replace: boolean },
    trx?: Transaction<DB>,
  ): Promise<TrainingEntity | null>;
  delete({ id }: { id: number }, trx?: Transaction<DB>): Promise<boolean>;
}

enum TrainingType {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  MIXED = 'MIXED',
}
const TRAININGS_REPOSITORY = Symbol('TRAININGS_REPOSITORY');

export { TrainingType, TRAININGS_REPOSITORY, TrainingsRepository, TrainingRawData };
