import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { TaskTransaction } from '../transaction-manager.port';

type TasksShapeTypes = 'with_group_links_left_join' | 'with_group_links_inner_join';

interface TasksReadRepository {
  getMany(
    shapes: TasksShapeTypes[],
    specifications: TasksSpecification,
    trx?: TaskTransaction,
  ): Promise<TaskView[]>;

  getByRange(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskView[]>;

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

export { TasksReadRepository, TasksShapeTypes };
