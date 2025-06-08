import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('repetitions_types')
    .addColumn('value', 'text', (col) => col.notNull().unique())
    .addCheckConstraint('repetition_types_values', sql`value in ('DONE', 'SKIP', 'TRIED', 'OVER')`)
    .addPrimaryKeyConstraint('repetition_types_fkey', ['value'])
    .execute();

  await db.schema
    .createTable('repetitions')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('exercises_id', 'integer', (col) =>
      col.references('exercises_templates.id').onDelete('cascade').notNull(),
    )
    .addColumn('user_id', 'integer')

    .addColumn('target_count', 'integer', (col) => col.notNull().check(sql`target_count <= 300`))
    .addColumn('fact_count', 'integer', (col) => col.check(sql`fact_count <= 300`))

    .addColumn('target_weight', 'numeric(5, 2)', (col) => col.notNull())
    .addColumn('fact_weight', 'numeric(5, 2)')

    .addColumn('target_break', 'integer', (col) => col.notNull().check(sql`target_break <= 600`))
    .addColumn('fact_break', 'integer', (col) => col.check(sql`fact_break <= 600`))

    .addColumn('finish_type', 'text', (col) =>
      col.references('repetitions_types.value').onDelete('restrict'),
    )

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('repetitions').execute();
}
