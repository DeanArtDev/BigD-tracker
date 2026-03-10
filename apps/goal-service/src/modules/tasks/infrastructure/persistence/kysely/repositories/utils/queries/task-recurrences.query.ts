import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';
import { RecurrenceFrequency, TaskRecurrenceStatus, TaskRecurrenceWeekday } from '@big-d/api-contracts';
import { sql } from 'kysely';

function taskRecurrencesQuery(db: TaskDatabase, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('tasks_recurrences')
    .innerJoin('recurrences_frequencies', 'tasks_recurrences.recurrence_frequencies_id', 'recurrences_frequencies.id')
    .innerJoin('recurrence_statuses', 'tasks_recurrences.recurrence_status_id', 'recurrence_statuses.id')
    .select([
      'tasks_recurrences.id as id',
      'tasks_recurrences.user_id as user_id',
      'tasks_recurrences.task_id as task_id',
      'tasks_recurrences.start_date as start_date',
      'tasks_recurrences.until_date as until_date',
      'tasks_recurrences.interval as interval',
      'tasks_recurrences.weekdays as weekdays',
      'tasks_recurrences.weekstart as weekstart',
      'tasks_recurrences.monthdays as monthdays',
      'tasks_recurrences.yearmonths as yearmonths',
      'tasks_recurrences.timezone as timezone',
      'tasks_recurrences.pattern as pattern',
      sql<TaskRecurrenceStatus>`recurrence_statuses.name`.as('recurrence_status'),
      sql<keyof typeof RecurrenceFrequency>`recurrences_frequencies.name`.as('recurrence_frequency'),
      sql<TaskRecurrenceWeekday>`tasks_recurrences.weekstart`.as('weekstart'),
      sql<TaskRecurrenceWeekday[]>`tasks_recurrences.weekdays`.as('weekdays'),
    ]);
}

export { taskRecurrencesQuery };
