import { TasksDB } from '@/modules/tasks/application/ports';
import { SelectQueryBuilder } from 'kysely';

function taskFullSelect(
  qb: SelectQueryBuilder<TasksDB, 'tasks' | 'task_statuses', { status: string }>,
) {
  return qb.select([
    'tasks.id as id',
    'tasks.user_id as user_id',
    'tasks.name as name',
    'tasks.description as description',
    'tasks.priority as priority',
    'tasks.weight as weight',
    'tasks.cancel_reason as cancel_reason',
    'tasks.start_date as start_date',
    'tasks.end_date as end_date',
    'tasks.deadline as deadline',
    'tasks.recurrence as recurrence',
  ]);
}

export { taskFullSelect };
