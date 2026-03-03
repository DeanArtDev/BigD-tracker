import { Task, TaskOverride } from '@/modules/tasks/domain';
import { TasksSpecification } from '../../specifications';
import { TaskTransaction } from '../transaction-manager.port';

interface TasksOverridesRepositoryWritePort {
  getManyMasterEvents(specifications: TasksSpecification, trx?: TaskTransaction): Promise<Task[]>;

  getManyOverrides(
    specifications: TasksSpecification,
    trx?: TaskTransaction,
  ): Promise<TaskOverride[]>;
}

export { TasksOverridesRepositoryWritePort };
