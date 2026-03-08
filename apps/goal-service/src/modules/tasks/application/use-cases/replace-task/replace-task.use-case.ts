import { ExceptionRecurrenceNotExist, ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskFactory, TaskOverrideFactory } from '@/modules/tasks/domain';
import { taskStatusToOverrideTypeMap } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksViewMapper, TaskView } from '../../dto';
import { TaskDatabase } from '../../ports';
import { TaskCheckerService, TaskOverrideService, TaskService, TaskTypeService } from '../../services';
import { ReplaceTaskCommand } from './replace-task.command';

@Injectable()
class ReplaceTaskUseCase {
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskCheckerService: TaskCheckerService,
    private readonly taskTypeService: TaskTypeService,
    private readonly taskOverrideService: TaskOverrideService,

    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  /*TODO:
   *  [] если task имеет recurrence нельзя давать ему менять startDate
   *  [] если таска уже имеет повторения ???
   *  []
   *  []
   * */
  async execute({ input }: ReplaceTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { id, ...patch } = input;
      const { isOrigin, isVirtual, data } = this.taskTypeService.getType({ taskId: id });

      if (isOrigin) {
        const { task, recurrence } = await this.taskServices.replaceTask({ ...patch, id: data.id }, trx);
        return TasksViewMapper.fromAggregateToView(task, recurrence ?? null);
      }

      if (isVirtual) {
        const { userId } = input;
        const { recurrenceId, date } = data;

        const recurrence = await this.taskOverrideService.getRecurrence({ userId, id: recurrenceId }, trx);
        if (recurrence == null) {
          throw new ExceptionRecurrenceNotExist({ recurrenceId });
        }

        const task = await this.taskCheckerService.ensureTaskExists({ userId, taskId: recurrence.taskId }, { trx });
        const taskToReplace = TaskFactory.replace(task, patch);

        const createdOverrideDraft = TaskOverrideFactory.create({
          task: taskToReplace,
          type: taskStatusToOverrideTypeMap[taskToReplace.status],
          recurrenceId: recurrence.id,
          recurrenceStart: date,
        });
        const createdOverride = await this.taskOverrideService.upsertOverride(createdOverrideDraft, trx);
        return TasksViewMapper.fromOverrideToView(createdOverride);
      }
      // if (isOverride) {
      //   /**
      //    * [] убедиться что оверрайд существует иначе исключение
      //    * [] обновить через агрегат
      //    * [] обновить в базе
      //    * [] добавить ограничение изменения дат только в рамках occurrenceStart
      //    * [] добавить ограничение occurrenceStart и startDate в рамках одного дня
      //    * []
      //    * */
      //   const { userId } = input;
      //   const { masterTaskId, timestamp, overrideId } = data;
      //
      //   const recurrence = await this.taskOverrideService.getRecurrence({ userId, id: masterTaskId }, trx);
      //   if (recurrence == null) {
      //     throw new ExceptionTaskNotExist({ taskId: masterTaskId });
      //   }
      //
      //   const updatedMasterEvent = TaskFactory.replace(recurrence, patch);
      //   const createdOverrideDraft = TaskOverrideFactory.create({
      //     task: updatedMasterEvent,
      //     type: taskStatusToOverrideTypeMap[updatedMasterEvent.status],
      //     occurrenceStart: timeAndDate(timestamp).toISOString(),
      //   });
      //   const createdOverride = await this.taskOverrideService.upsertOverride(createdOverrideDraft, trx);
      //   return TasksViewMapper.fromOverrideToView(createdOverride);
      // }

      // if (isVirtual) {
      //   const { userId } = input;
      //   const { recurrenceId, date } = data;
      //
      //   const recurrecne = await this.taskOverrideService.getRecurrence({ userId, id: recurrenceId }, trx);
      //   if (masterEvent == null) {
      //     throw new ExceptionTaskNotExist({ taskId: recurrenceId });
      //   }
      //
      //   if (
      //     patch.recurrence != null &&
      //     masterEvent.recurrence != null &&
      //     !isEqual(masterEvent.recurrence, patch.recurrence)
      //   ) {
      //     throw new ExceptionTaskDomainInvalidInvariant({
      //       message: `Повторяемое дело: ${masterEvent.id} не может быть мастер событием`,
      //       field: 'recurrence',
      //       taskId: id,
      //     });
      //   }
      //
      //   const updatedMasterEvent = TaskFactory.replace(masterEvent, patch);
      //   const createdOverrideDraft = TaskOverrideFactory.create({
      //     task: updatedMasterEvent,
      //     type: taskStatusToOverrideTypeMap[updatedMasterEvent.status],
      //     occurrenceStart: timeAndDate(timestamp).toISOString(),
      //   });
      //   const createdOverride = await this.taskOverrideService.upsertOverride(createdOverrideDraft, trx);
      //   return TasksViewMapper.fromOverrideToView(createdOverride);
      // }

      throw new ExceptionTaskUnprocessable({ taskId: id, message: 'Не валидный id' });
    });
  }
}

export { ReplaceTaskUseCase };
