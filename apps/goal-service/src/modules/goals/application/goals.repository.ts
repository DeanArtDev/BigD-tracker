import { DB } from '@/infrastructure/types';
import { GoalEntity } from '@/modules/goals/domain';
import { Selectable, Transaction } from 'kysely';

interface GoalRawData {
  readonly selectable: Omit<Selectable<DB['goals']>, 'updated_at' | 'created_at'>;
}

const GOALS_REPOSITORY = Symbol('GOALS_REPOSITORY');

interface GoalsRepository {
  findById(input: { id: number; userId: number }): Promise<GoalEntity | null>;
  findAllByUserId(input: { userId: number }): Promise<GoalEntity[]>;
  create(entity: GoalEntity, trx?: Transaction<DB>): Promise<GoalEntity | null>;
  delete(input: { id: number; userId: number }, trx?: Transaction<DB>): Promise<boolean>;
  update(
    entity: GoalEntity,
    options?: { replace: boolean },
    trx?: Transaction<DB>,
  ): Promise<GoalEntity | null>;
}

export { GOALS_REPOSITORY, GoalsRepository, GoalRawData };
