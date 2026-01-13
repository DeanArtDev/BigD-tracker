import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto';
import { Group, GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { Transaction } from 'kysely';

interface GroupsWriteRepository {
  createInbox(input: { userId: number }, trx?: Transaction<DB>): Promise<GroupInboxView>;

  createGroup(group: Group, trx?: Transaction<DB>): Promise<Group>;

  replaceGroupWithTasks(group: GroupWithTasks, trx?: Transaction<DB>): Promise<void>;

  getGroupById(
    input: { groupId: number; userId: number },
    trx?: Transaction<DB>,
  ): Promise<Group | null>;
}

export { GroupsWriteRepository };
