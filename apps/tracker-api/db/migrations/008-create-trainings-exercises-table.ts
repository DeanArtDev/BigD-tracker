import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('trainings_exercise_templates')
    .addColumn('training_id', 'integer', (col) =>
      col.notNull().references('trainings.id').onDelete('cascade'),
    )
    .addColumn('exercise_template_id', 'integer', (col) =>
      col.notNull().references('exercises_templates.id').onDelete('cascade'),
    )
    .addColumn('order', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_training_exercise_templates', [
      'training_id',
      'exercise_template_id',
    ])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('trainings_exercise_templates').execute();
}
