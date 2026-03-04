import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Дата виртуального дела для которого был оверрайд,
  // нужно для корректного отображения в календаре и правильного расчета прогресса выполнения
  await db.schema
    .alterTable('tasks_recurrence_overrides')
    .addColumn('occurrence_start', 'timestamptz', (col) => col.notNull())
    .execute();

  // Уникальный индекс для оверрайдов, чтобы не было двух оверрайдов на одно и то же виртуальное дело
  await db.schema
    .alterTable('tasks_recurrence_overrides')
    .addUniqueConstraint('tro_tid_os_unique', ['task_id', 'occurrence_start'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('tasks_recurrence_overrides').dropConstraint('tro_tid_os_unique').execute();

  await db.schema.alterTable('tasks_recurrence_overrides').dropColumn('occurrence_start').execute();
}
