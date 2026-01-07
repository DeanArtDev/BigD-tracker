import { DB } from '@/infrastructure/types';
import { Task } from '@/modules/tasks/domain';
import { Transaction } from 'kysely';

interface TasksWriteRepository {
  getTaskById(input: { id: number; userId: number }, trx?: Transaction<DB>): Promise<Task | null>;
  createTask(agr: Task, trx?: Transaction<DB>): Promise<Task>;
  replaceTask(agr: Task, trx?: Transaction<DB>): Promise<Task>;
  addTaskToGroup(input: { taskId: number; groupId: number }, trx?: Transaction<DB>): Promise<void>;
}

export { TasksWriteRepository };
