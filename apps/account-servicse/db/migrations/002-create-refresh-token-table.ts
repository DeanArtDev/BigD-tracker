import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('sessions')
    .addColumn('uuid', 'uuid', (col) => col.notNull())
    .addColumn('users_id', 'integer', (col) =>
      col.references('users.id').onDelete('cascade').notNull(),
    )
    .addColumn('user_agent', 'text', (col) => col.check(sql`char_length(user_agent) <= 256`))
    .addColumn('token', 'text', (col) => col.notNull())
    .addColumn('ip', 'text', (col) => col.check(sql`char_length(ip) <= 32`))
    .addColumn('revoked', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('sessions').execute();
}
