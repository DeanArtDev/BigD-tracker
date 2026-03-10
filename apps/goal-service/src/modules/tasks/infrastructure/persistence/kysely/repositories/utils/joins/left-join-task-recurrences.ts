import { RecurrenceFrequency, TaskRecurrenceStatus, TaskRecurrenceWeekday } from '@big-d/api-contracts';
import { sql } from 'kysely';
import { tasksWithStatusQuery } from '../queries';

function leftJoinTaskRecurrences(db: ReturnType<typeof tasksWithStatusQuery>) {
  return db
    .leftJoin('tasks_recurrences', 'tasks_recurrences.task_id', 'tasks.id')
    .leftJoin('recurrences_frequencies', 'tasks_recurrences.recurrence_frequencies_id', 'recurrences_frequencies.id')
    .leftJoin('recurrence_statuses', 'tasks_recurrences.recurrence_status_id', 'recurrence_statuses.id')
    .select([
      'tasks_recurrences.id as recurrence_id',
      'tasks_recurrences.user_id as recurrence_user_id',
      'tasks_recurrences.task_id as recurrence_task_id',
      'tasks_recurrences.start_date as recurrence_start_date',
      'tasks_recurrences.until_date as recurrence_until_date',
      'tasks_recurrences.interval as recurrence_interval',
      'tasks_recurrences.monthdays as recurrence_monthdays',
      'tasks_recurrences.yearmonths as recurrence_yearmonths',
      'tasks_recurrences.timezone as recurrence_timezone',
      'tasks_recurrences.pattern as recurrence_pattern',
      sql<TaskRecurrenceStatus>`recurrence_statuses.name`.as('recurrence_status'),
      sql<keyof typeof RecurrenceFrequency>`recurrences_frequencies.name`.as('recurrence_frequency'),
      sql<TaskRecurrenceWeekday>`tasks_recurrences.weekstart`.as('recurrence_weekstart'),
      sql<TaskRecurrenceWeekday[]>`tasks_recurrences.weekdays`.as('recurrence_weekdays'),
    ]);
}

export { leftJoinTaskRecurrences };
