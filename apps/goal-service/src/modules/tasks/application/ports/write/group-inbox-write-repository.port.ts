import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto';
import { Transaction } from 'kysely';

interface GroupInboxWriteRepository {
  createInbox(input: { userId: number }, trx?: Transaction<DB>): Promise<GroupInboxView>;
}

export { GroupInboxWriteRepository };
