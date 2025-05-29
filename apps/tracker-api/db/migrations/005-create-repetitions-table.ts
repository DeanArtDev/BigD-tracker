import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
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
  await db.schema.dropTable('repetitions').execute();
}
