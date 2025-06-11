import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('exercise_types')
    .addColumn('value', 'text', (col) => col.notNull().unique())
    .addCheckConstraint(
      'exercise_types_values',
      sql`value in ('WORM-UP', 'POST-TRAINING', 'AEROBIC', 'ANAEROBIC')`,
    )
    .addPrimaryKeyConstraint('exercise_types_fkey', ['value'])
    .execute();

  await db.schema
    .createTable('exercises')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade'))
    .addColumn('training_id', 'integer', (col) =>
      col.references('trainings.id').onDelete('cascade'),
    )
    .addColumn('training_template_id', 'integer', (col) =>
      col.references('trainings_templates.id').onDelete('cascade'),
    )
    .addColumn('name', 'text', (col) => col.notNull().check(sql`char_length(name) <= 256`))
    .addColumn('description', 'text')
    .addColumn('example_url', 'text', (col) => col.check(sql`char_length(name) <= 256`))
    .addColumn('type', 'text', (col) =>
      col.references('exercise_types.value').onDelete('restrict').notNull(),
    )

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('exercises').execute();
}
