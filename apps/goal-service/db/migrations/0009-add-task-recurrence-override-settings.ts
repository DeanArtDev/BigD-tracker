import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('task_recurrence_override_settings')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('tasks_recurrences_overrides_id', 'integer', (col) => col.notNull().unique())
    .addColumn('icon', 'text', (col) => col.check(sql`char_length(icon) <= 50`))
    .addColumn('is_all_day', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('task_recurrence_override_settings')
    .addForeignKeyConstraint(
      'task_recurrence_override_settings_tasks_recurrences_overrides_id_fk',
      ['tasks_recurrences_overrides_id'],
      'tasks_recurrences_overrides',
      ['id'],
      (cb) => cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('task_recurrence_override_settings').execute();
}
