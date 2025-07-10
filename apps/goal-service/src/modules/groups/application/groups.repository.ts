import { DB } from '@/infrastructure/types';
import { GroupEntity } from '@/modules/groups/domain';
import { Selectable, Transaction } from 'kysely';

interface GroupRawData {
  readonly selectable: Omit<Selectable<DB['groups']>, 'updated_at' | 'created_at'>;
}

const GROUPS_REPOSITORY = Symbol('GROUPS_REPOSITORY');

interface GroupsRepository {
  findById(input: { id: number; userId: number }): Promise<GroupEntity | null>;
  findUserInbox(input: { userId: number }): Promise<GroupEntity | null>;
  findByGoalId(input: { goalId: number; userId: number }): Promise<GroupEntity[]>;
  create(entity: GroupEntity, trx?: Transaction<DB>): Promise<GroupEntity | null>;
  update(
    entity: GroupEntity,
    options?: { replace: boolean },
    trx?: Transaction<DB>,
  ): Promise<GroupEntity | null>;
  upsert(
    entity: GroupEntity,
    options?: { replace: boolean },
    trx?: Transaction<DB>,
  ): Promise<GroupEntity | null>;
  delete(input: { id: number; userId: number }, trx?: Transaction<DB>): Promise<boolean>;
}

export { GroupRawData, GroupsRepository, GROUPS_REPOSITORY };
