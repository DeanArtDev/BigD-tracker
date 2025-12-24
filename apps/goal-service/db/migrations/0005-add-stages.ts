import { setUpdateTriggerOnUpdatedAt } from './helpers';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('stages')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    // Описание с поддержкой Wysiwyg
    .addColumn('description', 'text')
    // Тип этапа
    .addColumn('type_id', 'smallint', (col) => col.notNull())
    // Настройки этапа
    .addColumn('settings_id', 'integer')
    // Статус этапа
    .addColumn('status_id', 'smallint', (col) => col.notNull())
    // Дата фактического начала
    .addColumn('start_date', 'timestamptz', (col) => col.notNull())
    // Дата фактического завершнеия
    .addColumn('end_date', 'timestamptz', (col) => col.notNull())

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
  await setUpdateTriggerOnUpdatedAt('stages', db);

  // === Словари ===
  await db.schema
    .createTable('stage_types')
    .addColumn('id', 'smallint', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(150)', (col) => col.notNull().unique())
    .execute();

  await db.schema
    .createTable('stage_statuses')
    .addColumn('id', 'smallint', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(150)', (col) => col.notNull().unique())
    .execute();

  // === Таблицы связей ===
  await db.schema
    .createTable('goals_to_stages')
    .addColumn('goal_id', 'integer', (col) => col.notNull())
    .addColumn('stage_id', 'integer', (col) => col.notNull())
    // Позиция в списке
    .addColumn('position', 'smallint', (col) => col.notNull().defaultTo(0))
    .addPrimaryKeyConstraint('goals_to_stages_pkey', ['goal_id', 'stage_id'])
    .addUniqueConstraint('gts_goal_stage_ids_unique', ['goal_id', 'stage_id'])
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('goals_to_stages')
    .addForeignKeyConstraint('gts_goal_id_fk', ['goal_id'], 'goals', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('goals_to_stages')
    .addForeignKeyConstraint('gts_stage_id_fk', ['stage_id'], 'stages', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('stages')
    .addForeignKeyConstraint(
      'stages_stage_statuses_id_fk',
      ['status_id'],
      'stage_statuses',
      ['id'],
      (cb) => cb.onDelete('no action').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('stages')
    .addForeignKeyConstraint('stages_stage_types_id_fk', ['type_id'], 'stage_types', ['id'], (cb) =>
      cb.onDelete('no action').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('goals_to_stages').execute();
  await db.schema.dropTable('stages').execute();
  await db.schema.dropTable('stage_types').execute();
  await db.schema.dropTable('stage_statuses').execute();
}
