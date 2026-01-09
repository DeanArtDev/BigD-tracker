import { DB } from '@/infrastructure/types';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { ExceptionTaskNotFound } from '@/modules/tasks/application/exceptions';
import { TasksReadRepository, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TasksToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

@Injectable()
class TaskQueryService {
  constructor(
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepo: TasksReadRepository,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async getById(
    input: { taskId: number; userId: number },
    trx?: Transaction<DB>,
  ): Promise<TaskView> {
    const taskView = await this.tasksReadRepo.getById(
      { id: input.taskId, userId: input.userId },
      trx,
    );

    if (taskView == null) {
      throw new ExceptionTaskNotFound({ taskId: input.taskId });
    }

    return taskView;
  }
}

export { TaskQueryService };
