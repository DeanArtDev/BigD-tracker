import { setUpdateTriggerOnUpdatedAt } from './helpers';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('goals')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    // Имя цели
    .addColumn('name', 'varchar(256)', (col) => col.notNull())
    // Нет связи с сервисом account
    .addColumn('user_id', 'integer', (col) => col.notNull())
    // Описание с поддержкой Wysiwyg
    .addColumn('description', 'text')
    // Прогресс выполнения всех дел в цели
    .addColumn('progress', 'smallint', (col) => col.notNull().defaultTo(0))
    // Причина отмены цели
    .addColumn('cancel_reason', 'text')
    // Статус цели
    .addColumn('status_id', 'smallint', (col) => col.notNull())
    // Дата фактического начала
    .addColumn('start_date', 'timestamptz', (col) => col.notNull())
    // Дата фактического окончания
    .addColumn('end_date', 'timestamptz')

    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addCheckConstraint('goals_progress_check', sql`progress between 0 and 100`)
    .execute();
  await setUpdateTriggerOnUpdatedAt('goals', db);

  // === Словари ===
  await db.schema
    .createTable('goal_statuses')
    .addColumn('id', 'smallint', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(150)', (col) => col.notNull().unique())
    .execute();

  // === Таблицы связей ===
  await db.schema
    .createTable('groups_to_goals')
    .addColumn('goal_id', 'integer', (col) => col.notNull())
    .addColumn('group_id', 'integer', (col) => col.notNull())
    // Позиция в списке
    .addColumn('position', 'smallint', (col) => col.notNull().defaultTo(0))
    .addPrimaryKeyConstraint('groups_to_goals_pkey', ['goal_id', 'group_id'])
    .execute();

  await db.schema
    .createTable('goals_to_goals')
    // идентификатор родительской цели в которой goal_id является ребенком
    .addColumn('master_goal_id', 'integer', (col) => col.notNull())
    // идентификатор ребенка мастер цели
    .addColumn('goal_id', 'integer', (col) => col.notNull())
    // Позиция в списке
    .addColumn('position', 'smallint', (col) => col.notNull().defaultTo(0))
    .addPrimaryKeyConstraint('goals_to_goals_pkey', ['master_goal_id', 'goal_id'])
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('groups_to_goals')
    .addForeignKeyConstraint('groups_to_goals_goal_id_fk', ['goal_id'], 'goals', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('groups_to_goals')
    .addForeignKeyConstraint('groups_to_goals_group_id_fk', ['group_id'], 'groups', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('goals_to_goals')
    .addForeignKeyConstraint(
      'goals_to_goals_master_goal_id_fk',
      ['master_goal_id'],
      'goals',
      ['id'],
      (cb) => cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('goals_to_goals')
    .addForeignKeyConstraint('goals_to_goals_goal_id_fk', ['goal_id'], 'goals', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('goals')
    .addForeignKeyConstraint(
      'goals_goal_status_id_fk',
      ['status_id'],
      'goal_statuses',
      ['id'],
      (cb) => cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('groups_to_goals').execute();
  await db.schema.dropTable('goals_to_goals').execute();
  await db.schema.dropTable('goals').execute();
  await db.schema.dropTable('goal_statuses').execute();
}
