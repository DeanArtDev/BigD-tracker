import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { SortDirection } from '@big-d/api-contracts';
import { TaskTransaction } from '../transaction-manager.port';

interface TasksSorting {
  readonly priority?: SortDirection;
  readonly deadline?: SortDirection;
  readonly startDate?: SortDirection;
}

interface TasksReadRepository {
  getMany(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskView[]>;

  getByRange(
    specifications: TasksSpecification,
    params: { page: number; perPage: number },
    sort?: TasksSorting,
    trx?: TaskTransaction,
  ): Promise<TaskView[]>;

  getById(input: { id: number; userId: number }, trx?: TaskTransaction): Promise<TaskView | null>;

  isTaskIntoGroup(input: { taskId: number; groupId: number }, trx?: TaskTransaction): Promise<boolean>;
}

export { TasksReadRepository, TasksSorting };
