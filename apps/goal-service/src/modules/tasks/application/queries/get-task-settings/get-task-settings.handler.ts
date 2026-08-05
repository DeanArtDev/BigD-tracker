import { TasksOverridesToken, TasksToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TaskRecurrenceOverrideSettingsView, TaskSettingsDto, TaskSettingsView } from '../../dto';
import { TaskDatabase, TasksOverridesRepositoryWritePort, TasksReadRepository } from '../../ports';
import { TaskTypeService } from '../../services';
import { GetTaskSettingsQuery } from './get-task-settings.query';

@QueryHandler(GetTaskSettingsQuery)
class GetTaskSettingsHandler implements IQueryHandler<GetTaskSettingsQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepository: TasksReadRepository,
    @Inject(TasksOverridesToken.WRITE_REPOSITORY)
    private readonly tasksOverridesRepository: TasksOverridesRepositoryWritePort,
    private readonly taskTypeService: TaskTypeService,
  ) {}

  execute({ input }: GetTaskSettingsQuery): Promise<TaskSettingsDto[]> {
    return this.db.runTransaction(async (trx) => {
      const taskTypes = input.taskIds.map((taskId) => ({ taskId, type: this.taskTypeService.getType({ taskId }) }));
      const taskIds = new Set<number>();
      const recurrenceIds = new Set<number>();
      const overrideIds = new Set<number>();

      for (const { type } of taskTypes) {
        if (type.isOrigin) taskIds.add(type.data.id);
        if (type.isVirtual) recurrenceIds.add(type.data.recurrenceId);
        if (type.isOverride) overrideIds.add(type.data.overrideId);
      }

      const taskSettings = await this.tasksReadRepository.getManySettings(
        { userId: input.userId, taskIds: [...taskIds] },
        trx,
      );

      const virtualTaskSettings = await this.tasksReadRepository.getManyVirtualTaskSettings(
        { userId: input.userId, recurrenceIds: [...recurrenceIds] },
        trx,
      );
      const overrideSettings = await this.tasksOverridesRepository.getManySettings(
        { userId: input.userId, overrideIds: [...overrideIds] },
        trx,
      );

      const taskSettingsByTaskId = new Map<number, TaskSettingsView>();
      const taskSettingsByRecurrenceId = new Map<number, TaskSettingsView>();
      const overrideSettingsById = new Map<number, TaskRecurrenceOverrideSettingsView>();

      for (const settings of taskSettings) {
        taskSettingsByTaskId.set(settings.taskId, settings);
      }

      for (const { recurrenceId, settings } of virtualTaskSettings) {
        taskSettingsByRecurrenceId.set(recurrenceId, settings);
      }

      for (const settings of overrideSettings) {
        overrideSettingsById.set(settings.taskRecurrenceOverrideId, settings);
      }

      const buffer: TaskSettingsDto[] = [];

      for (const { taskId, type } of taskTypes) {
        if (type.isOrigin) {
          const s = taskSettingsByTaskId.get(type.data.id);
          if (s != null) buffer.push(new TaskSettingsDto(taskId, s.isAllDay, s.icon));
          continue;
        }

        if (type.isVirtual) {
          const s = taskSettingsByTaskId.get(type.data.recurrenceId);
          if (s != null) buffer.push(new TaskSettingsDto(taskId, s.isAllDay, s.icon));
          continue;
        }

        if (type.isOverride) {
          const s = taskSettingsByTaskId.get(type.data.overrideId);
          if (s != null) buffer.push(new TaskSettingsDto(taskId, s.isAllDay, s.icon));
        }
      }

      return buffer;
    });
  }
}

export { GetTaskSettingsHandler };
