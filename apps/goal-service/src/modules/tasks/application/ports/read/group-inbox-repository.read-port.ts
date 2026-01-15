import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto';
import { Transaction } from 'kysely';

interface GroupInboxReadRepository {
  getInboxWithTasksByUserId(
    input: { userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupInboxView | null>;

  ensureTaskInInbox(
    input: { userId: number; taskId: number },
    trx?: Transaction<DB>,
  ): Promise<{ success: boolean; inboxId: number }>;
}

export { GroupInboxReadRepository };
