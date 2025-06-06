import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('training_templates_exercise_templates')
    .addColumn('training_template_id', 'integer', (col) =>
      col.notNull().references('trainings_templates.id').onDelete('cascade'),
    )
    .addColumn('exercise_template_id', 'integer', (col) =>
      col.notNull().references('exercises_templates.id').onDelete('cascade'),
    )
    .addColumn('order', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('pk_training_templates_exercise_templates', [
      'training_template_id',
      'exercise_template_id',
    ])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('training_templates_exercise_templates').execute();
}
