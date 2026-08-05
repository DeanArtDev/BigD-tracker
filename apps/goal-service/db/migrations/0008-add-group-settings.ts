import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('group_settings')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('group_id', 'integer', (col) => col.notNull().unique())
    // light colors
    .addColumn('event_color', 'text', (col) => col.notNull().check(sql`char_length(event_color) <= 250`))
    .addColumn('event_selected_color', 'text', (col) =>
      col.notNull().check(sql`char_length(event_selected_color) <= 250`),
    )
    .addColumn('line_color', 'text', (col) => col.notNull().check(sql`char_length(line_color) <= 250`))
    .addColumn('text_color', 'text', (col) => col.notNull().check(sql`char_length(text_color) <= 250`))
    // dark colors
    .addColumn('event_color_dark', 'text', (col) => col.notNull().check(sql`char_length(event_color_dark) <= 250`))
    .addColumn('event_selected_color_dark', 'text', (col) =>
      col.notNull().check(sql`char_length(event_selected_color_dark) <= 250`),
    )
    .addColumn('line_color_dark', 'text', (col) => col.notNull().check(sql`char_length(line_color_dark) <= 250`))
    .addColumn('text_color_dark', 'text', (col) => col.notNull().check(sql`char_length(text_color_dark) <= 250`))
    // options
    .addColumn('is_default', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('is_visible', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('is_readonly', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('group_settings')
    .addForeignKeyConstraint('group_settings_group_id_fk', ['group_id'], 'groups', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('group_settings').execute();
}
