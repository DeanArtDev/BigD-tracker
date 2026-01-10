import { DB } from '@/infrastructure/types';
import { Task } from '@/modules/tasks/domain';
import { Transaction } from 'kysely';

interface TasksWriteRepository {
  getTaskById(
    input: { taskId: number; userId: number },
    trx?: Transaction<DB>,
  ): Promise<Task | null>;
  createTask(agr: Task, trx?: Transaction<DB>): Promise<Task>;
  deleteTask(input: { taskId: number; userId: number }, trx?: Transaction<DB>): Promise<boolean>;
  changeTaskStatus(task: Task, trx?: Transaction<DB>): Promise<void>;
  replaceTask(agr: Task, trx?: Transaction<DB>): Promise<Task>;
  addTaskToGroup(input: { taskId: number; groupId: number }, trx?: Transaction<DB>): Promise<void>;
  removeTaskFromGroup(
    input: { taskId: number; groupId: number },
    trx?: Transaction<DB>,
  ): Promise<void>;
}

export { TasksWriteRepository };
