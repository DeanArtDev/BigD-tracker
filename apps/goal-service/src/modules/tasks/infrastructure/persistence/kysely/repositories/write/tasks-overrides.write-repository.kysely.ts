import { TaskDatabase, TasksOverridesRepositoryWritePort, TaskTransaction } from '@/modules/tasks/application/ports';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { Task, TaskOverride } from '@/modules/tasks/domain';
import { TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { sql } from 'kysely';
import { TasksWriteKyselyMapper } from '../../mappers/tasks.write-mapper';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { BaseTasksRepository } from '../base-tasks.repository';
import { overrideTypeByNameQuery, statusByNameQuery, tasksWithStatusQuery } from '../utils';

@Injectable()
export class TasksOverridesWriteRepositoryKysely
  extends BaseTasksRepository
  implements TasksOverridesRepositoryWritePort
{
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async getManyMasterEvents(specifications: TasksSpecification, trx?: TaskTransaction): Promise<Task[]> {
    return await this.errorCatcher('tasks.get-many-master-events', async () => {
      const result = await tasksWithStatusQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .execute();

      return result.map(TasksWriteKyselyMapper.fromRawToAgr);
    });
  }

  async getOneMasterEvent(specifications: TasksSpecification, trx?: TaskTransaction): Promise<Task | null> {
    return await this.errorCatcher('tasks.get-one-master-event', async () => {
      const masterEvent = await tasksWithStatusQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .executeTakeFirst();
      if (masterEvent == null) return null;

      return TasksWriteKyselyMapper.fromRawToAgr(masterEvent);
    });
  }

  async getManyOverrides(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskOverride[]> {
    return await this.errorCatcher('tasks.get-many-overrides', async () => {
      const overrides = await this.db
        .qb(trx)
        .selectFrom('tasks_recurrence_overrides')
        .innerJoin('task_statuses', 'tasks_recurrence_overrides.status_id', 'task_statuses.id')
        .innerJoin(
          'tasks_recurrence_override_types',
          'tasks_recurrence_override_types.id',
          'tasks_recurrence_overrides.override_type_id',
        )
        .select([
          'tasks_recurrence_overrides.id as id',
          'tasks_recurrence_overrides.user_id as user_id',
          'tasks_recurrence_overrides.name as name',
          'tasks_recurrence_overrides.description as description',
          'tasks_recurrence_overrides.priority as priority',
          'tasks_recurrence_overrides.weight as weight',
          'tasks_recurrence_overrides.cancel_reason as cancel_reason',
          'tasks_recurrence_overrides.start_date as start_date',
          'tasks_recurrence_overrides.end_date as end_date',
          'tasks_recurrence_overrides.deadline as deadline',
          'tasks_recurrence_overrides.task_id as task_id',
          'tasks_recurrence_overrides.occurrence_start as occurrence_start',
          sql<TaskStatus>`task_statuses.name`.as('status'),
          sql<TaskOverrideType>`tasks_recurrence_override_types.name`.as('override_type'),
        ])
        .where((eb) => specifications.toExpr(eb))
        .execute();

      return overrides.map(TasksWriteKyselyMapper.fromRawToOverrideAgr);
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
        .insertInto('tasks_recurrence_overrides')
        .values({
          task_id: override.masterTaskId,
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
          occurrence_start: override.occurrenceStart,
        })
        .onConflict((oc) =>
          oc.columns(['task_id', 'occurrence_start']).doUpdateSet({
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
          }),
        )
        .returning([
          'id',
          'weight',
          'task_id',
          'cancel_reason',
          'name',
          'deadline',
          'end_date',
          'start_date',
          'description',
          'user_id',
          'priority',
          'override_type_id',
          'occurrence_start',
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
