import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto/group-inbox.view';
import { Transaction } from 'kysely';

interface GroupsWriteRepository {
  createInbox(input: { userId: number }, trx?: Transaction<DB>): Promise<GroupInboxView>;
}

export { GroupsWriteRepository };
