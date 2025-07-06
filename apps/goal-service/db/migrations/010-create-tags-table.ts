import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('tags')
    .addColumn('name', 'text', (col) =>
      col
        .check(sql`char_length(name) <= 30`)
        .unique()
        .notNull(),
    )
    .addPrimaryKeyConstraint('tags_fkey', ['name'])

    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable('things_tags')
    .addColumn('tag_name', 'text', (col) =>
      col.references('tags.name').onDelete('restrict').notNull(),
    )
    .addColumn('thing_id', 'integer', (col) =>
      col.references('things.id').onDelete('cascade').notNull(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('tags').execute();
  await db.schema.dropTable('things_tags').execute();
}
