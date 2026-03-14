import { TaskFactory } from '@/modules/tasks/domain';
import { TaskOverrideDomainService, TaskVirtualService } from '@/modules/tasks/domain/services';
import { TasksToken } from '@/modules/tasks/tokens';
import { TimezoneVo } from '@big-d/api-utils';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GoalServiceRequestContext } from '@shared/request-context';
import { ExceptionRecurrenceNotExist, ExceptionTaskUnprocessable } from '../../exceptions';
import { TaskDatabase, TasksWriteRepository } from '../../ports';
import { TaskCheckerService, TaskOverrideService, TaskRecurrenceService, TaskTypeService } from '../../services';
import { FinishTaskCommand } from './finish-task.command';

@Injectable()
class FinishTaskUseCase {
  private taskVirtualService = new TaskVirtualService();
  private taskOverrideDomainService = new TaskOverrideDomainService();

  constructor(
    private readonly taskCheckerService: TaskCheckerService,
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

      const request = GoalServiceRequestContext.getStore()?.state;
      const userTimezone = TimezoneVo.create(request?.userTimezone ?? 'UTC').value;

      if (isOrigin) {
        const task = await this.taskCheckerService.ensureTaskExists({ taskId: data.id, userId }, { trx });
        const finishedTask = TaskFactory.finish(task, userTimezone);
        await this.tasksWriteRepo.replaceTask(finishedTask, trx);
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
          timezone: userTimezone,
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
          timezone: userTimezone,
        });
        await this.taskOverrideService.upsertOverride(overrideToUpdate, trx);

        return;
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Не валидный id' });
    });
  }
}

export { FinishTaskUseCase };
