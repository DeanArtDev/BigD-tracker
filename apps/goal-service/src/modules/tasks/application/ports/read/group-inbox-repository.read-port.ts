import { GroupInboxView } from '@/modules/tasks/application/dto';
import { TaskTransaction } from '../transaction-manager.port';

interface GroupInboxReadRepository {
  getInboxWithTasksByUserId(
    input: { userId: number },
    trx?: TaskTransaction,
  ): Promise<GroupInboxView | null>;

  ensureTaskInInbox(
    input: { userId: number; taskId: number },
    trx?: TaskTransaction,
  ): Promise<{ success: boolean; inboxId: number }>;
}

export { GroupInboxReadRepository };
