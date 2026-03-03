import { ExceptionTaskNotFound, ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TaskCheckerService, TaskTypeService } from '../../services';
import { CompleteDeleteTaskCommand } from './complete-delete-task.command';

@Injectable()
class CompleteDeleteTaskUseCase {
  constructor(
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    private readonly taskTypeService: TaskTypeService,

    private readonly taskCheckerService: TaskCheckerService,
  ) {}

  async execute({ input }: CompleteDeleteTaskCommand): Promise<{ id: number }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId } = input;
      const { isOrigin, data } = this.taskTypeService.getType({ taskId });

      if (isOrigin) {
        const task = await this.taskCheckerService.ensureTaskExists({ taskId: data.id, userId }, { trx });
        TaskFactory.deleteComplete(task);

        const isDeleted = await this.tasksWriteRepo.deleteTask({ taskId: data.id, userId }, trx);
        if (!isDeleted) {
          throw new ExceptionTaskNotFound({ taskId: data.id });
        }

        return {
          id: task.id,
        };
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { CompleteDeleteTaskUseCase };
