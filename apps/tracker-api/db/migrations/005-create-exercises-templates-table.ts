import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('exercises_templates')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade'))

    .addColumn('name', 'text', (col) => col.notNull().check(sql`char_length(name) <= 256`))
    .addColumn('description', 'text')
    .addCheckConstraint('description_value', sql`char_length(description) <= 1024`)
    .addColumn('example_url', 'text', (col) => col.check(sql`char_length(name) <= 256`))
    .addColumn('type', 'text', (col) =>
      col.references('exercise_types.value').onDelete('restrict').notNull(),
    )

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('exercises_templates').execute();
}
