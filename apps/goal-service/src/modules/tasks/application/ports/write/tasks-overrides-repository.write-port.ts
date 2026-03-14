import { TaskOverride, TaskRecurrence } from '@/modules/tasks/domain';
import { TasksSpecification } from '../../specifications';
import { TaskTransaction } from '../transaction-manager.port';

interface TasksOverridesRepositoryWritePort {
  getManyRecurrences(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskRecurrence[]>;

  getOneRecurrence(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskRecurrence | null>;

  getManyOverrides(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskOverride[]>;

  getOneOverride(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskOverride | null>;

  upsertOverride(override: TaskOverride, trx?: TaskTransaction): Promise<TaskOverride>;

  upsertRecurrence(override: TaskRecurrence, trx?: TaskTransaction): Promise<TaskRecurrence>;

  updateGroupIdForManyOverride(
    input: { userId: number; recurrenceId: number; groupId?: number },
    trx?: TaskTransaction,
  ): Promise<void>;

  deleteRecurrence(input: { id: number }, trx?: TaskTransaction): Promise<boolean>;

  deleteManyOverride(specifications: TasksSpecification, trx?: TaskTransaction): Promise<number>;
}

export { TasksOverridesRepositoryWritePort };
