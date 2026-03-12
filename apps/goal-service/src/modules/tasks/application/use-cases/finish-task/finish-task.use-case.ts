import { ExceptionRecurrenceNotExist, ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskDatabase, TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TaskOverrideDomainService, TaskVirtualService } from '@/modules/tasks/domain/services';
import { TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import {
  InboxGroupCheckerService,
  TaskCheckerService,
  TaskOverrideService,
  TaskRecurrenceService,
  TaskTypeService,
} from '../../services';
import { FinishTaskCommand } from './finish-task.command';

@Injectable()
class FinishTaskUseCase {
  private taskVirtualService = new TaskVirtualService();
  private taskOverrideDomainService = new TaskOverrideDomainService();

  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    private readonly inboxGroupCheckerService: InboxGroupCheckerService,
    private readonly taskTypeService: TaskTypeService,
    private readonly taskRecurrenceService: TaskRecurrenceService,
    private readonly taskOverrideService: TaskOverrideService,

    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async execute({ input }: FinishTaskCommand): Promise<void> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId } = input;
      const { isOrigin, isVirtual, isOverride, data } = this.taskTypeService.getType({ taskId });

      if (isOrigin) {
        const task = await this.taskCheckerService.ensureTaskExists({ taskId: data.id, userId }, { trx });
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

      if (isVirtual) {
        const { recurrenceId } = data;

        const recurrence = await this.taskRecurrenceService.getRecurrence({ userId, id: recurrenceId }, trx);
        if (recurrence == null) {
          throw new ExceptionRecurrenceNotExist({ recurrenceId, taskId });
        }
        const task = await this.taskCheckerService.ensureTaskExists({ userId, taskId: recurrence?.taskId }, { trx });

        const { override: overrideToCreate } = this.taskVirtualService.finish({
          taskId,
          sourceTask: task,
          currentRecurrence: recurrence,
        });
        await this.taskOverrideService.upsertOverride(overrideToCreate, trx);

        return;
      }

      if (isOverride) {
        const { recurrenceId, overrideId } = data;

        const recurrence = await this.taskRecurrenceService.getRecurrence({ userId, id: recurrenceId }, trx);
        if (recurrence == null) {
          throw new ExceptionRecurrenceNotExist({ recurrenceId, taskId });
        }
        const task = await this.taskCheckerService.ensureTaskExists({ userId, taskId: recurrence?.taskId }, { trx });
        const currentOverride = await this.taskOverrideService.getOverride({ userId, id: overrideId }, trx);

        const { override: overrideToUpdate } = this.taskOverrideDomainService.finish({
          taskId,
          sourceTask: task,
          currentRecurrence: recurrence,
          override: currentOverride,
        });
        await this.taskOverrideService.upsertOverride(overrideToUpdate, trx);

        return;
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { FinishTaskUseCase };
