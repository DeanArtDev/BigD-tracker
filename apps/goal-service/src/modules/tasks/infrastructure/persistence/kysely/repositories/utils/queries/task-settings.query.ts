import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';

function taskSettingsQuery(db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('task_settings')
    .innerJoin('tasks', 'tasks.id', 'task_settings.task_id')
    .select(['task_settings.task_id as taskId', 'task_settings.icon as icon', 'task_settings.is_all_day as isAllDay']);
}

export { taskSettingsQuery };
