import { GroupInboxView } from '@/modules/tasks/application/dto';
import { TaskTransaction } from '../transaction-manager.port';

interface GroupInboxWriteRepository {
  createInbox(input: { userId: number }, trx?: TaskTransaction): Promise<GroupInboxView>;
}

export { GroupInboxWriteRepository };
