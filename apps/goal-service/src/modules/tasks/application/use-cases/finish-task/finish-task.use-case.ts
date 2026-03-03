import { ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { InboxGroupCheckerService, TaskCheckerService, TaskTypeService } from '../../services';
import { FinishTaskCommand } from './finish-task.command';

@Injectable()
class FinishTaskUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly inboxGroupCheckerService: InboxGroupCheckerService,
    private readonly taskTypeService: TaskTypeService,

    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async execute({ input }: FinishTaskCommand): Promise<void> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId } = input;
      const { isOrigin, data } = this.taskTypeService.getType({ taskId });

      if (isOrigin) {
        const task = await this.taskCheckerService.ensureTaskExists(
          { taskId: data.id, userId },
          { trx },
        );
        const finishedTask = TaskFactory.finish(task);

        await this.tasksWriteRepo.replaceTask(finishedTask, trx);

        const isTaskInGroup = await this.inboxGroupCheckerService.ensureTaskInInboxGroup(
          { taskId: data.id, userId },
          { trx, skipException: true },
        );

        if (isTaskInGroup) {
          await this.tasksWriteRepo.removeTaskFromGroup({ taskId: finishedTask.id }, trx);
        }

        return;
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { FinishTaskUseCase };
