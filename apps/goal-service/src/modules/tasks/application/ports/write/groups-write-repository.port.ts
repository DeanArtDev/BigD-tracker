import { DB } from '@/infrastructure/types';
import { Group, GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { Transaction } from 'kysely';

interface GroupsWriteRepository {
  createGroup(group: Group, trx?: Transaction<DB>): Promise<Group>;

  replaceGroupWithTasks(group: GroupWithTasks, trx?: Transaction<DB>): Promise<void>;

  getGroupById(
    input: { groupId: number; userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupWithTasks | null>;

  deleteById(input: { groupId: number; userId: number }, trx?: Transaction<DB>): Promise<boolean>;
}

export { GroupsWriteRepository };
