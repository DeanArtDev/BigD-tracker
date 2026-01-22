import { Task } from '@/modules/tasks/domain';
import { TaskTransaction } from '../transaction-manager.port';

const INBOX_GROUP_KEY = 'IN_BOX';

interface TasksInboxWriteRepository {
  createTaskIntoInbox(
    input: { task: Task; inboxId: number },
    trx?: TaskTransaction,
  ): Promise<{ id: number }>;
}

export { TasksInboxWriteRepository, INBOX_GROUP_KEY };
