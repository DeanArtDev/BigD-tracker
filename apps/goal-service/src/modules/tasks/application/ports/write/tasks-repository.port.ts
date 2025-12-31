import { DB } from '@/infrastructure/types';
import { Task } from '@/modules/tasks/domain';
import { Transaction } from 'kysely';

interface TasksRepository {
  createTask(agr: Task, trx?: Transaction<DB>): Promise<Task | null>;
}

export { TasksRepository };
