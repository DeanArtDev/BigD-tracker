import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';

function taskVirtualSettingsQuery(db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('tasks_recurrences')
    .innerJoin('tasks', 'tasks.id', 'tasks_recurrences.task_id')
    .innerJoin('task_settings', 'task_settings.task_id', 'tasks.id')
    .select([
      'tasks_recurrences.id as recurrenceId',
      'task_settings.task_id as taskId',
      'task_settings.icon as icon',
      'task_settings.is_all_day as isAllDay',
    ]);
}

export { taskVirtualSettingsQuery };
