import { TaskDatabase, TasksOverridesRepositoryWritePort, TaskTransaction } from '@/modules/tasks/application/ports';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { TaskOverride, TaskRecurrence } from '@/modules/tasks/domain';
import { TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { TasksWriteKyselyMapper } from '../../mappers/tasks.write-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { overrideTypeByNameQuery, statusByNameQuery, taskFrequencyByNameQuery, taskRecurrencesQuery } from '../utils';

@Injectable()
export class TasksOverridesWriteRepositoryKysely
  extends BaseTasksRepository
  implements TasksOverridesRepositoryWritePort
{
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
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
      const overrides = await this.db
        .qb(trx)
        .selectFrom('tasks_recurrences_overrides')
        .innerJoin('task_statuses', 'tasks_recurrences_overrides.status_id', 'task_statuses.id')
        .innerJoin(
          'tasks_recurrences_override_types',
          'tasks_recurrences_override_types.id',
          'tasks_recurrences_overrides.override_type_id',
        )
        .select([
          'tasks_recurrences_overrides.id as id',
          'tasks_recurrences_overrides.recurrence_id as recurrence_id',
          'tasks_recurrences_overrides.user_id as user_id',
          'tasks_recurrences_overrides.name as name',
          'tasks_recurrences_overrides.description as description',
          'tasks_recurrences_overrides.priority as priority',
          'tasks_recurrences_overrides.weight as weight',
          'tasks_recurrences_overrides.cancel_reason as cancel_reason',
          'tasks_recurrences_overrides.start_date as start_date',
          'tasks_recurrences_overrides.end_date as end_date',
          'tasks_recurrences_overrides.deadline as deadline',
          'tasks_recurrences_overrides.recurrence_start as recurrence_start',
          sql<TaskStatus>`task_statuses.name`.as('status'),
          sql<TaskOverrideType>`tasks_recurrences_override_types.name`.as('override_type'),
        ])
        .where((eb) => specifications.toExpr(eb))
        .execute();

      return overrides.map(TasksWriteKyselyMapper.fromRawToOverrideAgr);
    });
  }

  async upsertRecurrence(recurrence: TaskRecurrence, trx?: TaskTransaction): Promise<TaskRecurrence> {
    return await this.errorCatcher('tasks.upsert-recurrence', async () => {
      const { id: frequency_id, name: frequency_name } = await taskFrequencyByNameQuery(
        [recurrence.frequency.key],
        this.db,
        trx,
      ).executeTakeFirstOrThrow();

      const rawRecurrence = await this.db
        .qb(trx)
        .insertInto('tasks_recurrences')
        .values({
          id: recurrence.isDraft ? undefined : recurrence.id,
          user_id: recurrence.userId,
          task_id: recurrence.taskId,
          pattern: recurrence.pattern,
          start_date: recurrence.startDate,
          until_date: recurrence.untilDate,
          yearmonths: recurrence.yearmonths,
          monthdays: recurrence.monthdays,
          weekdays: recurrence.weekdays,
          interval: recurrence.interval,
          timezone: recurrence.timezone,
          weekstart: recurrence.weekstart,
          recurrence_frequencies_id: frequency_id,
        })
        .onConflict((oc) =>
          oc.columns(['id']).doUpdateSet({
            pattern: recurrence.pattern,
            start_date: recurrence.startDate,
            until_date: recurrence.untilDate,
            yearmonths: recurrence.yearmonths,
            monthdays: recurrence.monthdays,
            weekdays: recurrence.weekdays,
            interval: recurrence.interval,
            weekstart: recurrence.weekstart,
            recurrence_frequencies_id: frequency_id,
          }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

      return TasksWriteKyselyMapper.fromRawToRecurrence({ ...rawRecurrence, recurrence_frequency: frequency_name });
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
      const rawOverride = await this.db
        .qb(trx)
        .insertInto('tasks_recurrences_overrides')
        .values({
          recurrence_id: override.recurrenceId,
          cancel_reason: override.cancelReason,
          name: override.name,
          deadline: override.deadline,
          end_date: override.endDate,
          start_date: override.startDate,
          description: override.description,
          user_id: override.userId,
          priority: override.priority,
          status_id,
          weight: override.weight,
          override_type_id: overrideType.id,
          recurrence_start: override.recurrenceStart,
        })
        .onConflict((oc) =>
          oc.columns(['recurrence_id', 'recurrence_start']).doUpdateSet({
            cancel_reason: override.cancelReason,
            name: override.name,
            deadline: override.deadline,
            end_date: override.endDate,
            start_date: override.startDate,
            description: override.description,
            priority: override.priority,
            status_id,
            weight: override.weight,
            override_type_id: overrideType.id,
            recurrence_start: override.recurrenceStart,
          }),
        )
        .returning([
          'id',
          'weight',
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

      return TasksWriteKyselyMapper.fromRawToOverrideAgr({
        ...rawOverride,
        override_type: overrideType.name,
        status: status_name,
      });
    });
  }
}
