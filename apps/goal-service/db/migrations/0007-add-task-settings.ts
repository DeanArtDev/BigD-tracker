import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('task_settings')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('task_id', 'integer', (col) => col.notNull().unique())
    .addColumn('icon', 'text', (col) => col.check(sql`char_length(icon) <= 50`))
    .addColumn('is_all_day', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('task_settings')
    .addForeignKeyConstraint('task_settings_task_id_fk', ['task_id'], 'tasks', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('task_settings').execute();
}
