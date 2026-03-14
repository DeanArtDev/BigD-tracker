import { setUpdateTriggerOnUpdatedAt } from './helpers';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('tasks')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    // Нет связи с сервисом account
    .addColumn('user_id', 'integer', (col) => col.notNull())
    // Дело может быть только в одной группе
    .addColumn('group_id', 'integer')
    // Имя дела
    .addColumn('name', 'varchar(256)', (col) => col.notNull())
    // Описание с поддержкой Wysiwyg
    .addColumn('description', 'text')
    // Приоритетность 1 - важнейшее, 4 - самое не важное
    .addColumn('priority', 'smallint', (col) => col.notNull().defaultTo(4))
    // Вес дела для расчета общего прогресса выполнения
    .addColumn('weight', 'smallint', (col) => col.notNull().defaultTo(100))
    // Причина отмены дела
    .addColumn('cancel_reason', 'text')
    // Дата начала, не фактического
    .addColumn('start_date', 'timestamptz')
    // Дата фактического окончания
    .addColumn('end_date', 'timestamptz')
    // Дата к какой дате хотелось бы завершить дело
    .addColumn('deadline', 'timestamptz')
    // Статус дела
    .addColumn('status_id', 'smallint', (col) => col.notNull())

    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))

    .addCheckConstraint('tasks_priority_check', sql`priority in (1, 2, 3, 4)`)
    .addCheckConstraint('tasks_weight_check', sql`weight between 0 and 100`)
    .execute();
  await setUpdateTriggerOnUpdatedAt('tasks', db);

  // === Словари ===
  await db.schema
    .createTable('task_statuses')
    .addColumn('id', 'smallint', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(150)', (col) => col.notNull().unique())
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('tasks')
    .addForeignKeyConstraint('tasks_status_id_fk', ['status_id'], 'task_statuses', ['id'], (cb) =>
      cb.onDelete('no action').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('tasks').execute();
  await db.schema.dropTable('task_statuses').execute();
}
