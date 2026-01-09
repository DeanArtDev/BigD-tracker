import { DB } from '@/infrastructure/types';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { Transaction } from 'kysely';

interface TasksReadRepository {
  getById(input: { id: number; userId: number }, trx?: Transaction<DB>): Promise<TaskView | null>;
  isTaskIntoGroup(
    input: { taskId: number; groupId: number },
    trx?: Transaction<DB>,
  ): Promise<boolean>;
}

export { TasksReadRepository };
