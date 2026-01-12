import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto/group-inbox.view';
import { Group } from '@/modules/tasks/domain/aggregates/group';
import { Transaction } from 'kysely';

interface GroupsWriteRepository {
  createInbox(input: { userId: number }, trx?: Transaction<DB>): Promise<GroupInboxView>;
  createGroup(group: Group, trx?: Transaction<DB>): Promise<Group>;
}

export { GroupsWriteRepository };
