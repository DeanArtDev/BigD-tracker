import { ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { InboxGroupCheckerService, TaskCheckerService, TaskTypeService } from '../../services';
import { AssignTaskToInboxCommand } from './assign-task-to-inbox.command';

@Injectable()
class AssignTaskToInboxUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly inboxGroupCheckerService: InboxGroupCheckerService,
    private readonly taskTypeService: TaskTypeService,

    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: AssignTaskToInboxCommand): Promise<{ success: boolean }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId } = input;
      const { isOrigin, data } = this.taskTypeService.getType({ taskId });

      if (isOrigin) {
        const sureTask = await this.taskCheckerService.ensureTaskExists(
          { taskId: data.id, userId },
          { trx },
        );
        const { inboxId } = await this.inboxGroupCheckerService.ensureTaskNotInInboxGroup(
          { userId, taskId: data.id },
          { trx },
        );

        TaskFactory.assignToGroup(sureTask, 'IN_BOX');
        await this.tasksWriteRepo.removeTaskFromGroup({ taskId: data.id }, trx);
        await this.tasksWriteRepo.addTaskToGroup({ taskId: data.id, groupId: inboxId }, trx);
        return { success: true };
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { AssignTaskToInboxUseCase };
