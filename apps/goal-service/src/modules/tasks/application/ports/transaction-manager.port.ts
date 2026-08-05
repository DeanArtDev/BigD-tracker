import { DB } from '@/infrastructure/types';
import { IKyselyPostgresDB } from '@big-d/database';
import { Transaction } from 'kysely';

type TasksDB = Pick<
  DB,
  | 'tasks'
  | 'task_settings'
  | 'task_recurrence_override_settings'
  | 'groups'
  | 'group_settings'
  | 'group_statuses'
  | 'task_statuses'
  | 'tag_to_tasks'
  | 'task_to_group'
  | 'tasks_recurrences'
  | 'recurrences_frequencies'
  | 'recurrence_statuses'
  | 'tasks_recurrences_overrides'
  | 'tasks_recurrences_override_types'
>;

type GoalsDB = Pick<DB, 'goals' | 'goal_statuses' | 'goal_to_goals' | 'groups' | 'group_statuses' | 'group_to_goals'>;

type TaskDatabase = IKyselyPostgresDB<TasksDB>;
type GoalDatabase = IKyselyPostgresDB<GoalsDB>;

type TaskTransaction = Transaction<TasksDB>;
type GoalTransaction = Transaction<GoalsDB>;

export { TaskDatabase, TasksDB, TaskTransaction, GoalsDB, GoalDatabase, GoalTransaction };
