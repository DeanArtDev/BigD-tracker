import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';

function taskRecurrenceOverrideSettingsQuery(db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('task_recurrence_override_settings')
    .innerJoin(
      'tasks_recurrences_overrides',
      'tasks_recurrences_overrides.id',
      'task_recurrence_override_settings.tasks_recurrences_overrides_id',
    )
    .select([
      'task_recurrence_override_settings.tasks_recurrences_overrides_id as taskRecurrenceOverrideId',
      'task_recurrence_override_settings.icon as icon',
      'task_recurrence_override_settings.is_all_day as isAllDay',
    ]);
}

export { taskRecurrenceOverrideSettingsQuery };
