import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { TaskTransaction } from '../transaction-manager.port';

interface TasksReadRepository {
  getMany(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskView[]>;

  getByRange(
    input: { userId: number; from: string; to: string },
    trx?: TaskTransaction,
  ): Promise<TaskView[]>;

  getById(input: { id: number; userId: number }, trx?: TaskTransaction): Promise<TaskView | null>;

  getTaskToGroupLink(
    input: { taskId: number },
    trx?: TaskTransaction,
  ): Promise<{ taskId: number; groupId: number; position: number } | null>;

  isTaskIntoGroup(
    input: { taskId: number; groupId: number },
    trx?: TaskTransaction,
  ): Promise<boolean>;
}

export { TasksReadRepository };
