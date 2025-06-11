import { OmitCreateFields, Override } from '@shared/lib/type-helpers';
import { DB } from '@shared/modules/db';
import { Insertable, Selectable, Updateable } from 'kysely';
import { RepetitionEntity } from '../domain/repetition.entity';

interface RepetitionsRepository {
  createMany(data: RepetitionRawData['insertable'][]): Promise<RepetitionEntity[]>;
  update(data: RepetitionRawData['updateable']): Promise<RepetitionEntity | null>;
  findAllByFilters(filters: {
    exerciseId?: number;
    userId?: number | null;
  }): Promise<RepetitionEntity[]>;
  findOneById(id: number): Promise<RepetitionEntity | null>;
  findTemplatables(): Promise<RepetitionEntity[]>;
  deleteMany(ids: number[]): Promise<boolean>;
  deleteByExerciseIds(ids: number[]): Promise<number>;
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
