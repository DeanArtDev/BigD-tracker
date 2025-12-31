import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('tags')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(100)', (col) => col.notNull().unique())
    .addCheckConstraint('tags_name_length_check', sql`char_length(name) <= 25`)
    .execute();

  // === Таблицы связей ===
  await db.schema
    .createTable('tag_to_tasks')
    .addColumn('task_id', 'integer', (col) => col.notNull())
    .addColumn('tag_id', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('tag_to_tasks_pkey', ['task_id', 'tag_id'])
    .addUniqueConstraint('ttt_task_tag_ids_unique', ['task_id', 'tag_id'])
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('tag_to_tasks')
    .addForeignKeyConstraint('tag_to_tasks_task_id_fk', ['task_id'], 'tasks', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('tag_to_tasks')
    .addForeignKeyConstraint('tag_to_tasks_tag_id_fk', ['tag_id'], 'tags', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('tag_to_tasks').execute();
  await db.schema.dropTable('tags').execute();
}
