import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';
import { TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { sql } from 'kysely';

function overrideCommonQuery(db: TaskDatabase, trx?: TaskTransaction) {
  return db
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
      'tasks_recurrences_overrides.group_id as group_id',
      'tasks_recurrences_overrides.cancel_reason as cancel_reason',
      'tasks_recurrences_overrides.start_date as start_date',
      'tasks_recurrences_overrides.end_date as end_date',
      'tasks_recurrences_overrides.deadline as deadline',
      'tasks_recurrences_overrides.recurrence_start as recurrence_start',
      sql<TaskStatus>`task_statuses.name`.as('status'),
      sql<TaskOverrideType>`tasks_recurrences_override_types.name`.as('override_type'),
    ]);
}

export { overrideCommonQuery };
