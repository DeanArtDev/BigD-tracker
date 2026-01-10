import { setUpdateTriggerOnUpdatedAt } from './helpers';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('groups')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    // Имя группы
    .addColumn('name', 'varchar(256)', (col) => col.notNull())
    // Описание с поддержкой Wysiwyg
    .addColumn('description', 'text')
    // Нет связи с сервисом account
    .addColumn('user_id', 'integer', (col) => col.notNull())
    // Прогресс выполнения всех дел в группе
    .addColumn('progress', 'smallint', (col) => col.notNull().defaultTo(0))
    // Статус группы
    .addColumn('status_id', 'smallint', (col) => col.notNull())

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))

    .addCheckConstraint('groups_progress_check', sql`progress between 0 and 100`)
    .execute();
  await setUpdateTriggerOnUpdatedAt('groups', db);

  // === Словари ===
  await db.schema
    .createTable('group_statuses')
    .addColumn('id', 'smallint', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(150)', (col) => col.notNull().unique())
    .execute();

  // === Таблицы связей ===
  // одно дело не может быть в разных группах
  await db.schema
    .createTable('task_to_group')
    .addColumn('group_id', 'integer', (col) => col.notNull())
    .addColumn('task_id', 'integer', (col) => col.notNull())
    // Позиция в списке
    .addColumn('position', 'smallint', (col) => col.notNull().defaultTo(0))
    .addPrimaryKeyConstraint('ttg_pkey', ['group_id', 'task_id'])
    .execute();

  await db.schema.createIndex('ttg_task_id_idx').on('task_to_group').column('task_id').execute();

  await db.schema
    .createIndex('ttg_group_position_task_idx')
    .on('task_to_group')
    .columns(['group_id', 'position', 'task_id'])
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('groups')
    .addForeignKeyConstraint(
      'group_group_statuses_id_fk',
      ['status_id'],
      'group_statuses',
      ['id'],
      (cb) => cb.onDelete('no action').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('task_to_group')
    .addForeignKeyConstraint('ttg_task_id_fk', ['task_id'], 'tasks', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('task_to_group')
    .addForeignKeyConstraint('ttg_group_id_fk', ['group_id'], 'groups', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('task_to_group').execute();
  await db.schema.dropTable('groups').execute();
  await db.schema.dropTable('group_statuses').execute();
}
