import { DB } from '@/infrastructure/types';
import { Task } from '@/modules/tasks/domain';
import { Transaction } from 'kysely';

const INBOX_GROUP_KEY = 'IN_BOX';

interface TasksInboxWriteRepository {
  createTaskIntoInbox(
    input: { task: Task; inboxId: number },
    trx?: Transaction<DB>,
  ): Promise<{ id: number }>;
}

export { TasksInboxWriteRepository, INBOX_GROUP_KEY };
