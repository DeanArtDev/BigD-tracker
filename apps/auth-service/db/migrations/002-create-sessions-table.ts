import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('sessions')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('user_agent', 'text', (col) => col.check(sql`char_length(user_agent) <= 300`))
    .addColumn('token_hash', 'text', (col) => col.notNull().unique())
    .addColumn('ip', 'text', (col) => col.check(sql`char_length(ip) <= 32`))
    .addColumn('revoked', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('sessions')
    .addForeignKeyConstraint('session_user_id_fk', ['user_id'], 'users', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();

  // === Индексы ===
  await db.schema.createIndex('sessions_user_id_idx').on('sessions').column('user_id').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('sessions').execute();
}
