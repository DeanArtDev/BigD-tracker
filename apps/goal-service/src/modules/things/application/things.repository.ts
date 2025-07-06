import { DB } from '@/infrastructure/types';
import { ThingEntity } from '@/modules/things/domain';
import { Selectable, Transaction } from 'kysely';

interface ThingRawData {
  readonly selectable: Omit<Selectable<DB['things']>, 'updated_at' | 'created_at'>;
}

const THING_REPOSITORY = Symbol('THING_REPOSITORY');

interface ThingsRepository {
  findById(input: { id: number; userId: number }): Promise<ThingEntity | null>;
  findTodays(input: { userId: number }): Promise<ThingEntity[]>;
  findRepeatable(input: { userId: number }): Promise<ThingEntity[]>;
  findByGroupId(input: { groupId: number; userId: number }): Promise<ThingEntity[]>;
  create(entity: ThingEntity, trx?: Transaction<DB>): Promise<ThingEntity | null>;
  update(
    entity: ThingEntity,
    options?: { replace: boolean },
    trx?: Transaction<DB>,
  ): Promise<ThingEntity | null>;
  delete(input: { id: number; userId: number }, trx?: Transaction<DB>): Promise<boolean>;
}

export { ThingRawData, ThingsRepository, THING_REPOSITORY };
