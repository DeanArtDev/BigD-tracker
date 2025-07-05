import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('trainings_templates')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade'))
    .addColumn('name', 'text', (col) => col.notNull().check(sql`char_length(name) <= 256`))
    .addColumn('type', 'text', (col) =>
      col.references('trainings_types.value').onDelete('restrict').notNull(),
    )
    .addColumn('description', 'text')
    .addColumn('worm_up_duration', 'integer', (col) =>
      col.check(sql`post_training_duration >= 0 AND post_training_duration <= 60`),
    )
    .addColumn('post_training_duration', 'integer', (col) =>
      col.check(sql`post_training_duration >= 0 AND post_training_duration <= 60`),
    )

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('trainings_templates').execute();
}
