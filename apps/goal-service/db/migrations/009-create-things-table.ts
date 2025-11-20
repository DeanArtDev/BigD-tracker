import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('things')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull().check(sql`char_length(name) <= 256`))
    .addColumn('group_id', 'integer')
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('priority', 'smallint', (col) => col.check(sql`priority IN (1,2,3,4)`))
    .addColumn('start_date', 'timestamp')
    .addColumn('end_date', 'timestamp')
    .addColumn('deadline', 'timestamp')
    .addColumn('week_days', sql`smallint[]`, (col) =>
      col.check(sql`
          week_days IS NULL
          OR array_length(week_days, 1) = 1
          OR week_days <@ ARRAY[0,1,2,3,4,5,6]::smallint[]
      `),
    )
    .addColumn('result', 'integer', (col) =>
      col
        .defaultTo(0)
        .check(sql`result BETWEEN 0 AND 100`)
        .notNull(),
    )
    .addColumn('comment', 'text')
    .addColumn('position', 'integer', (col) => col.notNull().defaultTo(0))

    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('things').execute();
}
