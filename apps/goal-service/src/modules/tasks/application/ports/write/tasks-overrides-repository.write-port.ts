import {
  TaskRecurrenceOverrideSettingsView,
  TaskRecurrenceOverrideSettingsViewPatch,
} from '@/modules/tasks/application/dto';
import { TaskOverride, TaskRecurrence } from '@/modules/tasks/domain';
import { TasksSpecification } from '../../specifications';
import { TaskTransaction } from '../transaction-manager.port';

interface TasksOverridesRepositoryWritePort {
  getSettings(
    input: { overrideId: number; userId: number },
    trx?: TaskTransaction,
  ): Promise<TaskRecurrenceOverrideSettingsView | null>;

  getManySettings(
    input: { readonly overrideIds: number[]; readonly userId: number },
    trx?: TaskTransaction,
  ): Promise<TaskRecurrenceOverrideSettingsView[]>;

  updateSettings(
    input: { overrideId: number; patch: TaskRecurrenceOverrideSettingsViewPatch },
    trx?: TaskTransaction,
  ): Promise<boolean>;

  getManyRecurrences(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskRecurrence[]>;

  getOneRecurrence(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskRecurrence | null>;

  getManyOverrides(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskOverride[]>;

  getOneOverride(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskOverride | null>;

  upsertOverride(override: TaskOverride, trx?: TaskTransaction): Promise<TaskOverride>;

  updateOverride(override: TaskOverride, trx?: TaskTransaction): Promise<TaskOverride>;

  updateRecurrence(override: TaskRecurrence, trx?: TaskTransaction): Promise<TaskRecurrence>;

  upsertRecurrence(override: TaskRecurrence, trx?: TaskTransaction): Promise<TaskRecurrence>;

  updateGroupIdForManyOverride(
    input: { userId: number; recurrenceId: number; groupId?: number },
    trx?: TaskTransaction,
  ): Promise<void>;

  deleteRecurrence(input: { id: number }, trx?: TaskTransaction): Promise<boolean>;

  deleteManyOverride(specifications: TasksSpecification, trx?: TaskTransaction): Promise<number>;
}

export { TasksOverridesRepositoryWritePort };
