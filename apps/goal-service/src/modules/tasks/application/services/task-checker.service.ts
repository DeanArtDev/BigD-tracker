import { Task } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { ExceptionTaskNotExist } from '../exceptions';
import { TasksWriteRepository, TaskTransaction } from '../ports';

@Injectable()
class TaskCheckerService {
  constructor(@Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository) {}

  async ensureTaskExists(
    input: { taskId: number; userId: number },
    params?: { trx?: TaskTransaction; skipException?: false | undefined },
  ): Promise<Task>;
  async ensureTaskExists(
    input: { taskId: number; userId: number },
    params: { trx?: TaskTransaction; skipException: true },
  ): Promise<Task | null>;
  async ensureTaskExists(
    input: { taskId: number; userId: number },
    params?: { trx?: TaskTransaction; skipException?: boolean },
  ): Promise<Task | null> {
    const { skipException, trx } = params ?? {};

    const task = await this.tasksWriteRepo.getTaskById({ taskId: input.taskId, userId: input.userId }, trx);

    if (skipException != null) {
      return task;
    }

    if (task == null) {
      throw new ExceptionTaskNotExist({ taskId: input.taskId });
    }

    return task;
  }
}

export { TaskCheckerService };
