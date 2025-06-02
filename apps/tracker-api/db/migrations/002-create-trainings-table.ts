import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('trainings_types')
    .addColumn('value', 'text', (col) => col.notNull().unique())
    .addCheckConstraint('exercise_types_values', sql`value in ('LIGHT', 'MEDIUM','HARD', 'MIXED')`)
    .addPrimaryKeyConstraint('trainings_types_fkey', ['value'])
    .execute();

  await db.schema
    .createTable('trainings')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) =>
      col.references('users.id').onDelete('cascade').notNull(),
    )
    .addColumn('name', 'text', (col) => col.notNull().check(sql`char_length(name) <= 256`))
    .addColumn('type', 'text', (col) =>
      col.references('trainings_types.value').onDelete('restrict').notNull(),
    )
    .addColumn('description', 'text')
    .addCheckConstraint('description_value', sql`char_length(description) <= 1024`)
    .addColumn('start_date', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('end_date', 'timestamptz')
    .addColumn('worm_up_duration', 'integer', (col) =>
      col.check(sql`post_training_duration >= 0 AND post_training_duration <= 900000`),
    )
    .addColumn('post_training_duration', 'integer', (col) =>
      col.check(sql`post_training_duration >= 0 AND post_training_duration <= 900000`),
    )

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('trainings').execute();
  await db.schema.dropTable('trainings_types').execute();
}
