import { Task } from '@/modules/tasks/domain';
import { TaskTransaction } from '../transaction-manager.port';

interface TasksWriteRepository {
  getTaskById(input: { taskId: number; userId: number }, trx?: TaskTransaction): Promise<Task | null>;

  createTask(agr: Task, trx?: TaskTransaction): Promise<Task>;

  deleteTask(input: { taskId: number; userId: number }, trx?: TaskTransaction): Promise<boolean>;

  changeTaskStatus(task: Task, trx?: TaskTransaction): Promise<void>;

  replaceTask(agr: Task, trx?: TaskTransaction): Promise<Task>;

  addTaskToGroup(input: { taskId: number; groupId: number }, trx?: TaskTransaction): Promise<void>;

  removeTaskFromGroup(input: { taskId: number }, trx?: TaskTransaction): Promise<void>;
}

export { TasksWriteRepository };
