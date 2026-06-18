import { GroupInboxView } from '@/modules/tasks/application/dto';
import { TaskStatus } from '@big-d/api-contracts';
import { TaskTransaction } from '../transaction-manager.port';

interface GroupInboxReadRepository {
  getInboxByUserId(
    input: { userId: number; taskStatuses?: TaskStatus[] },
    trx?: TaskTransaction,
  ): Promise<GroupInboxView | null>;

  ensureTaskInInbox(
    input: { userId: number; taskId: number },
    trx?: TaskTransaction,
  ): Promise<{ success: boolean; inboxId: number }>;
}

export { GroupInboxReadRepository };
