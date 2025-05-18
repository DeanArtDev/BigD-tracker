import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('screen_name', 'text', (col) =>
      col.check(sql`char_length(screen_name) <= 128`),
    )
    .addColumn('email', 'text', (col) =>
      col
        .notNull()
        .check(sql`char_length(email) <= 256`)
        .unique(),
    )
    .addColumn('avatar', 'text')
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
}
