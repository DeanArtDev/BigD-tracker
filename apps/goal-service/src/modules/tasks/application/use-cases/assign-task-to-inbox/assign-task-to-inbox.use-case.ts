import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { ExceptionTaskUnprocessable } from '../../exceptions';
import { TaskDatabase, TasksWriteRepository } from '../../ports';
import { InboxGroupCheckerService, TaskCheckerService, TaskOverrideService, TaskTypeService } from '../../services';
import { AssignTaskToInboxCommand } from './assign-task-to-inbox.command';

@Injectable()
class AssignTaskToInboxUseCase {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly taskOverrideService: TaskOverrideService,
    private readonly inboxGroupCheckerService: InboxGroupCheckerService,
    private readonly taskTypeService: TaskTypeService,

    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: AssignTaskToInboxCommand): Promise<{ success: boolean }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId } = input;
      const { isOrigin, isVirtual, isOverride, data } = this.taskTypeService.getType({ taskId });

      if (isOrigin) {
        const sureTask = await this.taskCheckerService.ensureTaskExists({ taskId: data.id, userId }, { trx });
        const { inboxId } = await this.inboxGroupCheckerService.ensureTaskNotInInboxGroup(
          { userId, taskId: data.id },
          { trx },
        );

        const task = TaskFactory.assignToGroup(sureTask, inboxId);
        await this.tasksWriteRepo.replaceTask(task, trx);

        if (sureTask.recurrenceId != null) {
          await this.taskOverrideService.updateGroupIdForManyOverrides(
            { userId, groupId: inboxId, recurrenceId: sureTask.recurrenceId },
            trx,
          );
        }

        return { success: true };
      }

      if (isVirtual || isOverride) {
        const recurrence = await this.taskCheckerService.ensureRecurrenceExists(
          { id: data.recurrenceId, userId },
          { trx },
        );
        const sourceTask = await this.taskCheckerService.ensureTaskExists(
          { taskId: recurrence.taskId, userId },
          { trx },
        );
        const { inboxId } = await this.inboxGroupCheckerService.ensureTaskNotInInboxGroup(
          { userId, taskId: sourceTask.id },
          { trx },
        );
        const assignedTask = TaskFactory.assignToGroup(sourceTask, inboxId);
        await this.tasksWriteRepo.replaceTask(assignedTask, trx);
        await this.taskOverrideService.updateGroupIdForManyOverrides(
          { userId, groupId: inboxId, recurrenceId: recurrence.id },
          trx,
        );

        return { success: true };
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { AssignTaskToInboxUseCase };
