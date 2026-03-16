import { ExceptionTaskNotFound, ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskWithRecurrenceService } from '@/modules/tasks/domain/services';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TaskCheckerService, TaskTypeService } from '../../services';
import { CompleteDeleteTaskCommand } from './complete-delete-task.command';

@Injectable()
class CompleteDeleteTaskUseCase {
  private readonly taskWithRecurrenceService = new TaskWithRecurrenceService();

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
        const { taskToDelete } = this.taskWithRecurrenceService.deleteComplete({ task });
        const isDeleted = await this.tasksWriteRepo.deleteTask(
          { taskId: taskToDelete.id, userId: taskToDelete.userId },
          trx,
        );
        if (!isDeleted) {
          throw new ExceptionTaskNotFound({ taskId: data.id });
        }

        return {
          id: task.id,
        };
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Виртуальные и оверрайды дел нельзя удалить полностью' });
    });
  }
}

export { CompleteDeleteTaskUseCase };
