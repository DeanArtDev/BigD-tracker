import { setUpdateTriggerOnUpdatedAt } from './helpers';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('goals')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull().check(sql`char_length(name) <= 256`))
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('start_date', 'timestamp')
    .addColumn('end_date', 'timestamp')
    .addColumn('deadline', 'timestamp')
    .addColumn('result', 'integer', (col) =>
      col
        .defaultTo(0)
        .check(sql`result BETWEEN 0 AND 100`)
        .notNull(),
    )
    .addColumn('position', 'integer', (col) => col.notNull().defaultTo(0))

    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute();

  await setUpdateTriggerOnUpdatedAt('goals', db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('goals').execute();
}
