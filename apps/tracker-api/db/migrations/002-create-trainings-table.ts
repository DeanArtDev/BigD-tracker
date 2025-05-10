import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('trainings')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) =>
      col.notNull().check(sql`char_length(name) <= 256`),
    )
    .addColumn('description', 'text')
    .addCheckConstraint('description_value', sql`char_length(description) <= 1024`)
    .addColumn('start_date', 'timestamptz')
    .addColumn('end_date', 'timestamptz')
    .addColumn('worm_up_duration', 'timestamptz')
    .addColumn('post_training_duration', 'timestamptz')

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

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
    .addColumn('training_id', 'integer', (col) =>
      col.references('trainings.id').onDelete('cascade').notNull(),
    )
    .addColumn('name', 'text', (col) =>
      col.notNull().check(sql`char_length(name) <= 256`),
    )
    .addColumn('description', 'text')
    .addCheckConstraint('description_value', sql`char_length(description) <= 1024`)
    .addColumn('example_url', 'text', (col) => col.check(sql`char_length(name) <= 256`))
    .addColumn('type', 'text', (col) =>
      col.references('exercise_types.value').onDelete('restrict').notNull(),
    )

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable('repetitions')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('exercises_id', 'integer', (col) =>
      col.references('exercises.id').onDelete('cascade').notNull(),
    )
    .addColumn('count', 'integer', (col) => col.notNull())
    .addColumn('target_count', 'integer')
    .addColumn('weight', 'numeric(5, 2)', (col) => col.notNull())
    .addColumn('target_weight', 'numeric(5, 2)')
    .addColumn('finish_type', 'text', (col) => col.notNull().unique())
    .addCheckConstraint(
      'repetitions_finish_type_values',
      sql`finish_type in ('DONE', 'SKIP', 'TRIED')`,
    )
    .addColumn('break_expected_duration', 'timestamptz')
    .addColumn('break_actual_duration', 'timestamptz')
    .addColumn('start_date', 'timestamptz')
    .addColumn('end_date', 'timestamptz')

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('trainings').execute();
  await db.schema.dropTable('exercises').execute();
  await db.schema.dropTable('exercise_types').execute();
  await db.schema.dropTable('repetitions').execute();
}
