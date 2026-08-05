import { TasksOverridesToken, TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { omitUndefined } from '@shared/utils';
import { TaskRecurrenceOverrideSettingsView, TaskSettingsView } from '../../dto';
import {
  ExceptionTaskRecurrenceOverrideSettingsNotFound,
  ExceptionTaskSettingsNotFound,
  ExceptionTaskUnprocessable,
  ExceptionTaskWriteConflict,
} from '../../exceptions';
import {
  TaskDatabase,
  TasksOverridesRepositoryWritePort,
  TasksReadRepository,
  TasksWriteRepository,
} from '../../ports';
import { TaskTypeService } from '../../services';
import { UpdateTaskSettingsCommand } from './update-task-settings.command';

type UpdateTaskSettingsResult = TaskSettingsView | TaskRecurrenceOverrideSettingsView;

@Injectable()
class UpdateTaskSettingsUseCase {
  constructor(
    private readonly taskTypeService: TaskTypeService,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepo: TasksReadRepository,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
    @Inject(TasksOverridesToken.WRITE_REPOSITORY)
    private readonly tasksOverridesWriteRepo: TasksOverridesRepositoryWritePort,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
  ) {}

  execute({ input }: UpdateTaskSettingsCommand): Promise<UpdateTaskSettingsResult> {
    return this.db.runTransaction(async (trx) => {
      const { taskId, userId, ...patch } = input;
      const taskType = this.taskTypeService.getType({ taskId });
      const definedPatch = omitUndefined(patch);

      if (taskType.isOrigin) {
        const originTaskId = taskType.data.id;
        const currentSettings = await this.tasksReadRepo.getSettings({ taskId: originTaskId, userId }, trx);

        if (currentSettings == null) {
          throw new ExceptionTaskSettingsNotFound({ taskId });
        }

        if (Object.keys(definedPatch).length === 0) return currentSettings;

        const updatedSettings = TaskSettingsView.restore({ ...currentSettings, ...definedPatch });
        if (currentSettings.isEqual(updatedSettings)) return currentSettings;

        const isUpdated = await this.tasksWriteRepo.updateSettings({ taskId: originTaskId, patch: definedPatch }, trx);

        if (!isUpdated) {
          throw new ExceptionTaskWriteConflict({
            subjectId: originTaskId,
            message: 'Task settings could not be updated',
          });
        }

        return updatedSettings;
      }

      if (taskType.isOverride) {
        const overrideId = taskType.data.overrideId;
        const currentSettings = await this.tasksOverridesWriteRepo.getSettings({ overrideId, userId }, trx);

        if (currentSettings == null) {
          throw new ExceptionTaskRecurrenceOverrideSettingsNotFound({ taskId });
        }

        if (Object.keys(definedPatch).length === 0) return currentSettings;

        const updatedSettings = TaskRecurrenceOverrideSettingsView.restore({
          ...currentSettings,
          ...definedPatch,
        });
        if (currentSettings.isEqual(updatedSettings)) return currentSettings;

        const isUpdated = await this.tasksOverridesWriteRepo.updateSettings({ overrideId, patch: definedPatch }, trx);

        if (!isUpdated) {
          throw new ExceptionTaskWriteConflict({
            subjectId: overrideId,
            message: 'Task recurrence override settings could not be updated',
          });
        }

        return updatedSettings;
      }

      throw new ExceptionTaskUnprocessable({ taskId, message: 'Настройки нельзя обновить у виртуального дела' });
    });
  }
}

export { UpdateTaskSettingsResult, UpdateTaskSettingsUseCase };
