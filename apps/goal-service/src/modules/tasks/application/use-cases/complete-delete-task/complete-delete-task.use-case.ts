import { ExceptionTaskNotFound } from '@/modules/tasks/application/exceptions';
import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { CompleteDeleteTaskCommand } from './complete-delete-task.command';

@Injectable()
class CompleteDeleteTaskUseCase {
  constructor(
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: CompleteDeleteTaskCommand): Promise<{ id: number }> {
    return this.db.runTransaction(async (trx) => {
      const isDeleted = await this.tasksWriteRepo.deleteTask(
        { taskId: input.taskId, userId: input.userId },
        trx,
      );

      if (!isDeleted) {
        throw new ExceptionTaskNotFound({ taskId: input.taskId });
      }

      return {
        id: input.taskId,
      };
    });
  }
}

export { CompleteDeleteTaskUseCase };
