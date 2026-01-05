import { DB } from '@/infrastructure/types';
import { Task } from '@/modules/tasks/domain';
import { Transaction } from 'kysely';

interface TasksWriteRepository {
  createTask(agr: Task, trx?: Transaction<DB>): Promise<{ id: number }>;
  addTaskToGroup(input: { taskId: number; groupId: number }, trx?: Transaction<DB>): Promise<void>;
}

export { TasksWriteRepository };
