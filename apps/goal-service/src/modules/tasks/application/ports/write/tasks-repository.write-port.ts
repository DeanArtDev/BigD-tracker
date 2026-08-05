import { TaskSettingsViewPatch } from '@/modules/tasks/application/dto';
import { Task } from '@/modules/tasks/domain';
import { TaskTransaction } from '../transaction-manager.port';

interface TasksWriteRepository {
  getTaskById(input: { taskId: number; userId: number }, trx?: TaskTransaction): Promise<Task | null>;

  createTask(agr: Task, trx?: TaskTransaction): Promise<Task>;

  deleteTask(input: { taskId: number; userId: number }, trx?: TaskTransaction): Promise<boolean>;

  replaceTask(agr: Task, trx?: TaskTransaction): Promise<Task>;

  updateSettings(input: { taskId: number; patch: TaskSettingsViewPatch }, trx?: TaskTransaction): Promise<boolean>;
}

export { TasksWriteRepository };
