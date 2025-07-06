import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('groups')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull().check(sql`char_length(name) <= 256`))
    .addColumn('description', 'text')
    .addColumn('goal_id', 'integer', (col) =>
      col.references('goals.id').onDelete('cascade').notNull(),
    )
    .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade'))
    .addColumn('result', 'integer', (col) => col.defaultTo(0).check(sql`result BETWEEN 0 AND 100`))

    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('groups').execute();
}
