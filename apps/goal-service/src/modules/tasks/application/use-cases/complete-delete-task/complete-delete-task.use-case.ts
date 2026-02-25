import { ExceptionTaskNotFound } from '@/modules/tasks/application/exceptions';
import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TaskCheckerService } from '../../services';
import { CompleteDeleteTaskCommand } from './complete-delete-task.command';

@Injectable()
class CompleteDeleteTaskUseCase {
  constructor(
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,

    private readonly taskCheckerService: TaskCheckerService,
  ) {}

  async execute({ input }: CompleteDeleteTaskCommand): Promise<{ id: number }> {
    return this.db.runTransaction(async (trx) => {
      const task = await this.taskCheckerService.ensureTaskExists(input, { trx });
      TaskFactory.deleteComplete(task);

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
