import { OmitCreateFields, Override } from '@big-d/api-utils';
import { DB } from '@infrastructure/types';
import { TrainingEntity } from '@modules/tranings/domain';
import { Insertable, Selectable, Transaction, Updateable } from 'kysely';

interface TrainingRawData {
  readonly selectable: Omit<Selectable<DB['trainings']>, 'updated_at' | 'created_at'>;
  readonly updateable: Omit<Override<Updateable<DB['trainings']>, 'id', number>, 'updated_at' | 'created_at'>;
  readonly insertable: OmitCreateFields<Insertable<DB['trainings']>>;
}

interface TrainingsRepository {
  findActive(trx?: Transaction<DB>): Promise<TrainingEntity | null>;
  findOneById(data: { id: number }, trx?: Transaction<DB>): Promise<TrainingEntity | null>;
  find(
    data: {
      userId?: number | null;
      from?: string;
      to?: string;
    },
    trx?: Transaction<DB>,
  ): Promise<TrainingEntity[]>;
  create(data: TrainingRawData['insertable'], trx?: Transaction<DB>): Promise<TrainingEntity | null>;
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
