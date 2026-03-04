import { ExceptionTaskNotExist, ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskFactory, TaskOverrideFactory } from '@/modules/tasks/domain';
import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { taskStatusToOverrideTypeMap } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { timeAndDate } from '@shared/date-and-time';
import { isEqual } from 'lodash';
import { TasksViewMapper, TaskView } from '../../dto';
import { TaskDatabase } from '../../ports';
import { TaskOverrideService, TaskService, TaskTypeService } from '../../services';
import { ReplaceTaskCommand } from './replace-task.command';

@Injectable()
class ReplaceTaskUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskTypeService: TaskTypeService,
    private readonly taskOverrideService: TaskOverrideService,

    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  async execute({ input }: ReplaceTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { id, ...patch } = input;
      const { isOrigin, isVirtual, data } = this.taskTypeService.getType({ taskId: id });

      if (isOrigin) {
        const task = await this.taskServices.replaceTask({ ...patch, id: data.id }, trx);
        return TasksViewMapper.fromAggregateToView(task);
      }

      if (isVirtual) {
        const { userId } = input;
        const { masterTaskId, timestamp } = data;

        const masterEvent = await this.taskOverrideService.getMasterEvent({ userId, masterEventId: masterTaskId }, trx);
        if (masterEvent == null) {
          throw new ExceptionTaskNotExist({ taskId: masterTaskId });
        }

        if (
          patch.recurrence != null &&
          masterEvent.recurrence != null &&
          !isEqual(masterEvent.recurrence, patch.recurrence)
        ) {
          throw new ExceptionTaskDomainInvalidInvariant({
            message: `Повторяемое дело: ${masterEvent.id} не может быть мастер событием`,
            field: 'recurrence',
            taskId: id,
          });
        }

        const updatedMasterEvent = TaskFactory.replace(masterEvent, patch);
        const updatedVirtualTask = TaskOverrideFactory.create({
          task: updatedMasterEvent,
          type: taskStatusToOverrideTypeMap[updatedMasterEvent.status],
          occurrenceStart: timeAndDate(timestamp).toISOString(),
        });
        const createdOverride = await this.taskOverrideService.upsertOverride(updatedVirtualTask, trx);
        return TasksViewMapper.fromOverrideToView(createdOverride);
      }

      throw new ExceptionTaskUnprocessable({ taskId: id, message: 'Не валидный id' });
    });
  }
}

export { ReplaceTaskUseCase };
