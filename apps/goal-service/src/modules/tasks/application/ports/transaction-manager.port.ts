import { DB } from '@/infrastructure/types';
import { IKyselyPostgresDB } from '@big-d/database';
import { Transaction } from 'kysely';

type TasksDB = Pick<
  DB,
  'tasks' | 'groups' | 'group_statuses' | 'task_statuses' | 'tag_to_tasks' | 'task_to_group'
>;

type Database = IKyselyPostgresDB<TasksDB>;

type TaskTransaction = Transaction<TasksDB>;

export { Database, TasksDB, TaskTransaction };
