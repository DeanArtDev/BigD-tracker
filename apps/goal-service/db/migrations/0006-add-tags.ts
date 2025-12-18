import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('tags')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addCheckConstraint('tags_name_length_check', sql`char_length(name) <= 25`)
    .execute();

  // === Таблицы связей ===
  await db.schema
    .createTable('tags_to_things')
    .addColumn('thing_id', 'bigint', (col) => col.notNull())
    .addColumn('tag_id', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('tags_to_things_pkey', ['thing_id', 'tag_id'])
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('tags_to_things')
    .addForeignKeyConstraint('tags_to_things_thing_id_fk', ['thing_id'], 'things', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('tags_to_things')
    .addForeignKeyConstraint('tags_to_things_tag_id_fk', ['tag_id'], 'tags', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('tags_to_things').execute();
  await db.schema.dropTable('tags').execute();
}
