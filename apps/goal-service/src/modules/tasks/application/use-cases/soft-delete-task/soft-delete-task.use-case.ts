import { ExceptionRecurrenceNotExist, ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskOverrideDomainService, TaskVirtualService } from '@/modules/tasks/domain/services';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TaskDatabase } from '../../ports';
import {
  TaskCheckerService,
  TaskOverrideService,
  TaskRecurrenceService,
  TaskService,
  TaskTypeService,
} from '../../services';
import { SoftDeleteTaskCommand } from './soft-delete-task.command';

@Injectable()
class SoftDeleteTaskUseCase {
  private taskVirtualService = new TaskVirtualService();
  private taskOverrideDomainService = new TaskOverrideDomainService();

  constructor(
    private readonly taskServices: TaskService,
    private readonly taskCheckerService: TaskCheckerService,
    private readonly taskTypeService: TaskTypeService,
    private readonly taskRecurrenceService: TaskRecurrenceService,
    private readonly taskOverrideService: TaskOverrideService,

    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: SoftDeleteTaskCommand): Promise<{ id: number }> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId } = input;

      const { isOrigin, isVirtual, isOverride, data } = this.taskTypeService.getType({ taskId });
      if (isOrigin) {
        return await this.taskServices.softDeleteTask({ taskId: data.id, userId }, trx);
      }

      if (isVirtual) {
        const { recurrenceId } = data;

        const recurrence = await this.taskRecurrenceService.getRecurrence({ userId, id: recurrenceId }, trx);
        if (recurrence == null) {
          throw new ExceptionRecurrenceNotExist({ recurrenceId, taskId });
        }
        const task = await this.taskCheckerService.ensureTaskExists({ userId, taskId: recurrence?.taskId }, { trx });
        const { override: overrideToCreate } = this.taskVirtualService.delete({
          taskId,
          sourceTask: task,
          currentRecurrence: recurrence,
        });
        const newOverride = await this.taskOverrideService.upsertOverride(overrideToCreate, trx);

        return { id: newOverride.id };
      }

      if (isOverride) {
        const { recurrenceId, overrideId } = data;

        const recurrence = await this.taskRecurrenceService.getRecurrence({ userId, id: recurrenceId }, trx);
        if (recurrence == null) {
          throw new ExceptionRecurrenceNotExist({ recurrenceId, taskId });
        }
        const task = await this.taskCheckerService.ensureTaskExists({ userId, taskId: recurrence?.taskId }, { trx });
        const currentOverride = await this.taskOverrideService.getOverride({ userId, id: overrideId }, trx);
        const allOverridesByRecurrence = await this.taskOverrideService.getOverridesByRecurrenceId(
          { userId, recurrenceId },
          trx,
        );

        const { overrideToDelete, shouldDeleteRecurrence } = this.taskOverrideDomainService.delete({
          taskId,
          sourceTask: task,
          currentRecurrence: recurrence,
          override: currentOverride,
          currentOverrides: allOverridesByRecurrence,
        });

        const updatedOverride = await this.taskOverrideService.upsertOverride(overrideToDelete, trx);
        if (shouldDeleteRecurrence) {
          await this.taskRecurrenceService.deleteRecurrence({ id: recurrence.id }, trx);
        }

        return { id: updatedOverride.id };
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { SoftDeleteTaskUseCase };
