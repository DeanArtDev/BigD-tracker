import { ExceptionRecurrenceNotExist, ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskFactory, TaskOverrideFactory } from '@/modules/tasks/domain';
import { taskStatusToOverrideTypeMap } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksViewMapper, TaskView } from '../../dto';
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
  constructor(
    private readonly taskServices: TaskService,
    private readonly taskCheckerService: TaskCheckerService,
    private readonly taskTypeService: TaskTypeService,
    private readonly taskOverrideService: TaskOverrideService,
    private readonly taskRecurrenceService: TaskRecurrenceService,

    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  /*TODO:
   *  [] если task имеет recurrence нельзя давать ему менять startDate
   *  [] если таска уже имеет повторения ???
   *  [x] если отключить повторения у исходной таски то удалить все recurrences и overrides связанные с ней
   *  [] добавить ограничение изменения дат только в рамках occurrenceStart
   *  [] добавить ограничение occurrenceStart и startDate в рамках одного дня
   * */
  async execute({ input }: ReplaceTaskCommand): Promise<TaskView> {
    return this.db.runTransaction(async (trx) => {
      const { id, ...patch } = input;
      const { isOrigin, isVirtual, isOverride, data } = this.taskTypeService.getType({ taskId: id });

      if (isOrigin) {
        const { task, recurrence } = await this.taskServices.replaceTask({ ...patch, id: data.id }, trx);
        return TasksViewMapper.fromAggregateToView(task, recurrence ?? null);
      }

      if (isVirtual) {
        const { userId } = input;
        const { recurrenceId, date } = data;

        const recurrence = await this.taskRecurrenceService.getRecurrence({ userId, id: recurrenceId }, trx);
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

      if (isOverride) {
        const { userId } = input;
        const { recurrenceId, overrideId } = data;

        const recurrence = await this.taskRecurrenceService.getRecurrence({ userId, id: recurrenceId }, trx);
        if (recurrence == null) {
          throw new ExceptionRecurrenceNotExist({ recurrenceId });
        }

        const task = await this.taskCheckerService.ensureTaskExists({ userId, taskId: recurrence.taskId }, { trx });
        const override = await this.taskOverrideService.getOverride({ userId, id: overrideId }, trx);

        const overrideToUpdate = TaskOverrideFactory.replace(override, {
          task: TaskFactory.replace(task, patch),
          type: taskStatusToOverrideTypeMap[task.status],
        });

        const createdOverride = await this.taskOverrideService.upsertOverride(overrideToUpdate, trx);
        return TasksViewMapper.fromOverrideToView(createdOverride);
      }

      throw new ExceptionTaskUnprocessable({ taskId: id, message: 'Не валидный id' });
    });
  }
}

export { ReplaceTaskUseCase };
