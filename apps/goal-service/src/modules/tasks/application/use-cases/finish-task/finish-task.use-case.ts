import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { InboxGroupCheckerService, TaskCheckerService } from '../../services';
import { FinishTaskCommand } from './finish-task.command';

@Injectable()
class FinishTaskUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly inboxGroupCheckerService: InboxGroupCheckerService,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async execute({ input }: FinishTaskCommand): Promise<void> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId } = input;
      const task = await this.taskCheckerService.ensureTaskExists({ taskId, userId }, { trx });
      const finishedTask = TaskFactory.finish(task);

      await this.tasksWriteRepo.replaceTask(finishedTask, trx);

      if (
        await this.inboxGroupCheckerService.ensureTaskInInboxGroup(
          { taskId, userId },
          { trx, skipException: true },
        )
      ) {
        await this.tasksWriteRepo.removeTaskFromGroup({ taskId: finishedTask.id }, trx);
      }

      return;
    });
  }
}

export { FinishTaskUseCase };
