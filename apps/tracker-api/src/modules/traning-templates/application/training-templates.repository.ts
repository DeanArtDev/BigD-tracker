import { DB } from '@/infrastructure/db';
import { TrainingTemplateEntity } from '../domain/entities';
import { OmitCreateFields, Override } from '@shared/lib/type-helpers';
import { Insertable, Selectable, Transaction, Updateable } from 'kysely';

interface TrainingTemplateRawData {
  readonly selectable: Omit<Selectable<DB['trainings_templates']>, 'updated_at' | 'created_at'>;
  readonly updateable: Omit<
    Override<Updateable<DB['trainings_templates']>, 'id', number>,
    'updated_at' | 'created_at'
  >;
  readonly insertable: OmitCreateFields<Insertable<DB['trainings_templates']>>;
}

interface TrainingTemplatesRepository {
  findOneById(data: { id: number }, trx?: Transaction<DB>): Promise<TrainingTemplateEntity | null>;
  find(
    data: {
      userId?: number;
      onlyUser?: boolean;
    },
    trx?: Transaction<DB>,
  ): Promise<TrainingTemplateEntity[]>;
  create(
    data: TrainingTemplateRawData['insertable'],
    trx?: Transaction<DB>,
  ): Promise<TrainingTemplateEntity | null>;
  update(
    data: TrainingTemplateRawData['updateable'],
    options?: { replace: boolean },
    trx?: Transaction<DB>,
  ): Promise<TrainingTemplateEntity | null>;
  delete({ id }: { id: number }, trx?: Transaction<DB>): Promise<boolean>;
}

const TRAINING_TEMPLATES_REPOSITORY = Symbol('TRAINING_TEMPLATES_REPOSITORY');

export {
  TRAINING_TEMPLATES_REPOSITORY,
  TrainingTemplateEntity,
  TrainingTemplateRawData,
  TrainingTemplatesRepository,
};
