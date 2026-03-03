import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { SortDirection } from '@big-d/api-contracts';
import { TaskTransaction } from '../transaction-manager.port';

type TasksShapeTypes = 'with_group_links_left_join' | 'with_group_links_inner_join';
interface TasksSorting {
  readonly priority?: SortDirection;
  readonly deadline?: SortDirection;
  readonly startDate?: SortDirection;
}

interface TasksReadRepository {
  getMany(shapes: TasksShapeTypes[], specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskView[]>;

  getByRange(
    specifications: TasksSpecification,
    params: { page: number; perPage: number },
    sort?: TasksSorting,
    trx?: TaskTransaction,
  ): Promise<TaskView[]>;

  getById(input: { id: number; userId: number }, trx?: TaskTransaction): Promise<TaskView | null>;

  isTaskIntoGroup(input: { taskId: number; groupId: number }, trx?: TaskTransaction): Promise<boolean>;
}

export { TasksReadRepository, TasksShapeTypes, TasksSorting };
