import { TaskOverrideDomainService, TaskVirtualService } from '@/modules/tasks/domain/services';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksViewMapper, TaskView } from '../../dto';
import { ExceptionRecurrenceNotExist, ExceptionTaskUnprocessable } from '../../exceptions';
import { TaskDatabase } from '../../ports';
import {
  TaskCheckerService,
  TaskOverrideService,
  TaskRecurrenceService,
  TaskService,
  TaskTypeService,
} from '../../services';
import { ReplaceTaskCommand } from './replace-task.command';

@Injectable()
class ReplaceTaskUseCase {
  private readonly taskOverrideDomainService = new TaskOverrideDomainService();
  private readonly taskVirtualService = new TaskVirtualService();

  constructor(
    private readonly taskServices: TaskService,
    private readonly taskCheckerService: TaskCheckerService,
    private readonly taskTypeService: TaskTypeService,
    private readonly taskOverrideService: TaskOverrideService,
    private readonly taskRecurrenceService: TaskRecurrenceService,

    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: ReplaceTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { id, ...patch } = input;
      const { isOrigin, isVirtual, isOverride, data } = this.taskTypeService.getType({ taskId: id });

      if (isOrigin) {
        const { task, recurrence } = await this.taskServices.replaceTask({ ...patch, id: data.id }, trx);
        return TasksViewMapper.fromAggregateToView(task, recurrence ?? null);
      }

      if (isVirtual) {
        this.taskVirtualService.ensureVirtualTaskNotRepeatable({ recurrence: input.recurrence, taskId: id });

        const { userId } = input;
        const { recurrenceId, date } = data;

        const recurrence = await this.taskRecurrenceService.getRecurrence({ userId, id: recurrenceId }, trx);
        if (recurrence == null) {
          throw new ExceptionRecurrenceNotExist({ recurrenceId });
        }

        const task = await this.taskCheckerService.ensureTaskExists({ userId, taskId: recurrence.taskId }, { trx });

        const { overrideToCreate } = this.taskOverrideDomainService.create({
          taskId: id,
          sourceTask: task,
          currentRecurrence: recurrence,

          overridePatch: patch,
          recurrenceStart: date,
        });

        const createdOverride = await this.taskOverrideService.upsertOverride(overrideToCreate, trx);
        return TasksViewMapper.fromOverrideToView(createdOverride);
      }

      if (isOverride) {
        this.taskOverrideDomainService.ensureOverrideTaskNotRepeatable({ recurrence: input.recurrence, taskId: id });

        const { userId } = input;
        const { recurrenceId, overrideId } = data;

        const recurrence = await this.taskRecurrenceService.getRecurrence({ userId, id: recurrenceId }, trx);
        if (recurrence == null) {
          throw new ExceptionRecurrenceNotExist({ recurrenceId });
        }

        const task = await this.taskCheckerService.ensureTaskExists({ userId, taskId: recurrence.taskId }, { trx });
        const override = await this.taskOverrideService.getOverride({ userId, id: overrideId }, trx);

        const { overrideToReplace } = this.taskOverrideDomainService.replace({
          taskId: id,
          sourceTask: task,
          currentRecurrence: recurrence,

          override,
          overridePatch: patch,
        });

        const createdOverride = await this.taskOverrideService.upsertOverride(overrideToReplace, trx);
        return TasksViewMapper.fromOverrideToView(createdOverride);
      }

      throw new ExceptionTaskUnprocessable({ taskId: id, message: 'Не валидный id' });
    });
  }
}

export { ReplaceTaskUseCase };
