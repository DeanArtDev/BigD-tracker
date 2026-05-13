import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('screen_name', 'text', (col) => col.check(sql`char_length(screen_name) <= 128`))
    .addColumn('email', 'text', (col) =>
      col
        .notNull()
        .check(sql`char_length(email) <= 256`)
        .unique(),
    )
    .addColumn('avatar', 'text')
    .addColumn('type_id', 'smallint', (col) => col.notNull())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  // === Словари ===
  await db.schema
    .createTable('user_types')
    .addColumn('id', 'smallint', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(150)', (col) => col.notNull().unique())
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('users')
    .addForeignKeyConstraint('users_type_id_fk', ['type_id'], 'user_types', ['id'], (cb) =>
      cb.onDelete('no action').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_types').execute();
  await db.schema.dropTable('users').execute();
}
