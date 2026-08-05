import {
  TaskRecurrenceOverrideSettingsView,
  TaskRecurrenceOverrideSettingsViewPatch,
  TaskSettingsView,
} from '@/modules/tasks/application/dto';
import { TaskDatabase, TasksOverridesRepositoryWritePort, TaskTransaction } from '@/modules/tasks/application/ports';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { TaskOverride, TaskRecurrence } from '@/modules/tasks/domain';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksWriteKyselyMapper } from '../../mappers/tasks.write-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import {
  overrideCommonQuery,
  overrideTypeByNameQuery,
  recurrenceStatusByNameQuery,
  statusByNameQuery,
  taskFrequencyByNameQuery,
  taskRecurrenceOverrideSettingsQuery,
  taskRecurrencesQuery,
} from '../utils';

@Injectable()
export class TasksOverridesWriteRepositoryKysely
  extends BaseTasksRepository
  implements TasksOverridesRepositoryWritePort
{
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async getSettings(
    input: { overrideId: number; userId: number },
    trx?: TaskTransaction,
  ): Promise<TaskRecurrenceOverrideSettingsView | null> {
    return await this.errorCatcher('tasks.get-override-settings', async () => {
      const settings = await taskRecurrenceOverrideSettingsQuery(this.db, trx)
        .where('task_recurrence_override_settings.tasks_recurrences_overrides_id', '=', input.overrideId)
        .where('tasks_recurrences_overrides.user_id', '=', input.userId)
        .executeTakeFirst();

      return settings == null ? null : TaskRecurrenceOverrideSettingsView.restore(settings);
    });
  }

  async getManySettings(
    input: { readonly overrideIds: number[]; readonly userId: number },
    trx?: TaskTransaction,
  ): Promise<TaskRecurrenceOverrideSettingsView[]> {
    return await this.errorCatcher('tasks.get-many-override-settings', async () => {
      const { overrideIds, userId } = input;
      if (overrideIds.length === 0) return [];

      const settings = await taskRecurrenceOverrideSettingsQuery(this.db, trx)
        .where('tasks_recurrences_overrides.user_id', '=', userId)
        .where('task_recurrence_override_settings.tasks_recurrences_overrides_id', 'in', overrideIds)
        .execute();

      return settings.map((setting) => TaskRecurrenceOverrideSettingsView.restore(setting));
    });
  }

  async updateSettings(
    input: { overrideId: number; patch: TaskRecurrenceOverrideSettingsViewPatch },
    trx?: TaskTransaction,
  ): Promise<boolean> {
    return await this.errorCatcher('tasks.update-override-settings', async () => {
      const { overrideId, patch } = input;
      if (Object.values(patch).every((value) => value === undefined)) return true;

      const result = await this.db
        .qb(trx)
        .updateTable('task_recurrence_override_settings')
        .set({
          icon: patch.icon,
          is_all_day: patch.isAllDay,
        })
        .where('tasks_recurrences_overrides_id', '=', overrideId)
        .executeTakeFirst();

      return result.numUpdatedRows > 0;
    });
  }

  async getManyRecurrences(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskRecurrence[]> {
    return await this.errorCatcher('tasks.get-many-recurrences', async () => {
      const result = await taskRecurrencesQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .execute();

      return result.map(TasksWriteKyselyMapper.fromRawToRecurrence);
    });
  }

  async getOneRecurrence(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskRecurrence | null> {
    return await this.errorCatcher('tasks.get-one-recurrence', async () => {
      const masterEvent = await taskRecurrencesQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .executeTakeFirst();
      if (masterEvent == null) return null;

      return TasksWriteKyselyMapper.fromRawToRecurrence(masterEvent);
    });
  }

  async getManyOverrides(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskOverride[]> {
    return await this.errorCatcher('tasks.get-many-overrides', async () => {
      const overrides = await overrideCommonQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .execute();

      return overrides.map(TasksWriteKyselyMapper.fromRawToOverrideAgr);
    });
  }

  async getOneOverride(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskOverride | null> {
    return await this.errorCatcher('tasks.get-one-override', async () => {
      const override = await overrideCommonQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .executeTakeFirst();
      if (override == null) return null;

      return TasksWriteKyselyMapper.fromRawToOverrideAgr(override);
    });
  }

  async deleteRecurrence(input: { id: number }, trx?: TaskTransaction): Promise<boolean> {
    return await this.errorCatcher('tasks.delete-recurrence', async () => {
      const result = await this.db
        .qb(trx)
        .deleteFrom('tasks_recurrences')
        .where('id', '=', input.id)
        .executeTakeFirst();

      return result.numDeletedRows > 0;
    });
  }

  async deleteManyOverride(specifications: TasksSpecification, trx?: TaskTransaction): Promise<number> {
    return await this.errorCatcher('tasks.delete-many-overrides', async () => {
      const result = await this.db
        .qb(trx)
        .deleteFrom('tasks_recurrences_overrides')
        .where((eb) => specifications.toExpr(eb))
        .executeTakeFirst();

      return Number(result.numDeletedRows);
    });
  }

  async updateRecurrence(recurrence: TaskRecurrence, trx?: TaskTransaction): Promise<TaskRecurrence> {
    return await this.errorCatcher('tasks.update-recurrence', async () => {
      const { id: frequency_id, name: frequency_name } = await taskFrequencyByNameQuery(
        [recurrence.frequency.key],
        this.db,
        trx,
      ).executeTakeFirstOrThrow();

      const { id: recurrence_status_id, name: recurrence_status } = await recurrenceStatusByNameQuery(
        [recurrence.status],
        this.db,
        trx,
      ).executeTakeFirstOrThrow();

      const rawRecurrence = await this.db
        .qb(trx)
        .updateTable('tasks_recurrences')
        .where('tasks_recurrences.id', '=', recurrence.id)
        .set({
          pattern: recurrence.pattern,
          start_date: recurrence.startDate,
          until_date: recurrence.untilDate ?? null,
          yearmonths: recurrence.yearmonths ?? null,
          monthdays: recurrence.monthdays ?? null,
          weekdays: recurrence.weekdays ?? null,
          interval: recurrence.interval ?? null,
          weekstart: recurrence.weekstart,
          recurrence_status_id,
          recurrence_frequencies_id: frequency_id,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return TasksWriteKyselyMapper.fromRawToRecurrence({
        ...rawRecurrence,
        recurrence_frequency: frequency_name,
        recurrence_status,
      });
    });
  }

  async upsertRecurrence(recurrence: TaskRecurrence, trx?: TaskTransaction): Promise<TaskRecurrence> {
    return await this.errorCatcher('tasks.upsert-recurrence', async () => {
      const { id: frequency_id, name: frequency_name } = await taskFrequencyByNameQuery(
        [recurrence.frequency.key],
        this.db,
        trx,
      ).executeTakeFirstOrThrow();

      const { id: recurrence_status_id, name: recurrence_status } = await recurrenceStatusByNameQuery(
        [recurrence.status],
        this.db,
        trx,
      ).executeTakeFirstOrThrow();

      const upsertData = {
        pattern: recurrence.pattern,
        start_date: recurrence.startDate,
        until_date: recurrence.untilDate ?? null,
        yearmonths: recurrence.yearmonths ?? null,
        monthdays: recurrence.monthdays ?? null,
        weekdays: recurrence.weekdays ?? null,
        interval: recurrence.interval ?? null,
        weekstart: recurrence.weekstart,
        recurrence_status_id,
        recurrence_frequencies_id: frequency_id,
      };

      const rawRecurrence = await this.db
        .qb(trx)
        .insertInto('tasks_recurrences')
        .values({
          user_id: recurrence.userId,
          task_id: recurrence.taskId,
          timezone: recurrence.timezone,
          ...upsertData,
        })
        .onConflict((oc) => oc.columns(['task_id', 'start_date']).doUpdateSet(upsertData))
        .returningAll()
        .executeTakeFirstOrThrow();

      return TasksWriteKyselyMapper.fromRawToRecurrence({
        ...rawRecurrence,
        recurrence_frequency: frequency_name,
        recurrence_status,
      });
    });
  }

  async updateGroupIdForManyOverride(
    input: { userId: number; recurrenceId: number; groupId?: number },
    trx?: TaskTransaction,
  ): Promise<void> {
    return await this.errorCatcher('tasks.update-overrides-group-id', async () => {
      await this.db
        .qb(trx)
        .updateTable('tasks_recurrences_overrides')
        .set({
          group_id: input.groupId ?? null,
        })
        .where('recurrence_id', '=', input.recurrenceId)
        .execute();
    });
  }

  async upsertOverride(override: TaskOverride, trx?: TaskTransaction): Promise<TaskOverride> {
    return await this.errorCatcher('tasks.upsert-override', async () => {
      const { id: status_id, name: status_name } = await statusByNameQuery(
        [override.status],
        this.db,
        trx,
      ).executeTakeFirstOrThrow();

      const overrideType = await overrideTypeByNameQuery([override.type], this.db, trx).executeTakeFirstOrThrow();
      const upsertData = {
        cancel_reason: override.cancelReason ?? null,
        group_id: override.groupId ?? null,
        name: override.name,
        deadline: override.deadline ?? null,
        end_date: override.endDate ?? null,
        start_date: override.startDate,
        description: override.description ?? null,
        priority: override.priority,
        status_id,
        override_type_id: overrideType.id,
        recurrence_start: override.recurrenceStart,
      };

      const rawOverride = await this.db
        .qb(trx)
        .insertInto('tasks_recurrences_overrides')
        .values({
          recurrence_id: override.recurrenceId,
          user_id: override.userId,
          ...upsertData,
        })
        .onConflict((oc) => oc.columns(['recurrence_id', 'recurrence_start']).doUpdateSet(upsertData))
        .returning([
          'id',
          'group_id',
          'recurrence_id',
          'cancel_reason',
          'name',
          'deadline',
          'end_date',
          'start_date',
          'description',
          'user_id',
          'priority',
          'override_type_id',
          'recurrence_start',
        ])
        .executeTakeFirstOrThrow();

      const rawTaskSettings = await this.db
        .qb(trx)
        .selectFrom('tasks_recurrences')
        .innerJoin('task_settings', 'task_settings.task_id', 'tasks_recurrences.task_id')
        .where('tasks_recurrences.id', '=', override.recurrenceId)
        .select([
          'task_settings.task_id as task_id',
          'task_settings.icon as icon',
          'task_settings.is_all_day as is_all_day',
        ])
        .executeTakeFirstOrThrow();

      const taskSettings = TaskSettingsView.restore({
        taskId: rawTaskSettings.task_id,
        icon: rawTaskSettings.icon,
        isAllDay: rawTaskSettings.is_all_day,
      });
      const overrideSettings = TaskRecurrenceOverrideSettingsView.create({
        taskRecurrenceOverrideId: rawOverride.id,
        taskSettings,
      });

      await this.db
        .qb(trx)
        .insertInto('task_recurrence_override_settings')
        .values({
          tasks_recurrences_overrides_id: overrideSettings.taskRecurrenceOverrideId,
          icon: overrideSettings.icon ?? null,
          is_all_day: overrideSettings.isAllDay,
        })
        .onConflict((oc) => oc.column('tasks_recurrences_overrides_id').doNothing())
        .executeTakeFirstOrThrow();

      return TasksWriteKyselyMapper.fromRawToOverrideAgr({
        ...rawOverride,
        override_type: overrideType.name,
        status: status_name,
      });
    });
  }

  async updateOverride(override: TaskOverride, trx?: TaskTransaction): Promise<TaskOverride> {
    return await this.errorCatcher('tasks.update-override', async () => {
      const { id: status_id, name: status_name } = await statusByNameQuery(
        [override.status],
        this.db,
        trx,
      ).executeTakeFirstOrThrow();

      const overrideType = await overrideTypeByNameQuery([override.type], this.db, trx).executeTakeFirstOrThrow();

      const rawOverride = await this.db
        .qb(trx)
        .updateTable('tasks_recurrences_overrides')
        .where('id', '=', override.id)
        .set({
          cancel_reason: override.cancelReason ?? null,
          group_id: override.groupId ?? null,
          name: override.name,
          deadline: override.deadline ?? null,
          end_date: override.endDate ?? null,
          start_date: override.startDate,
          description: override.description ?? null,
          priority: override.priority,
          status_id,
          override_type_id: overrideType.id,
          recurrence_start: override.recurrenceStart,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return TasksWriteKyselyMapper.fromRawToOverrideAgr({
        ...rawOverride,
        override_type: overrideType.name,
        status: status_name,
      });
    });
  }
}
