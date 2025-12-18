import { setUpdateTriggerOnUpdatedAt } from './helpers';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Таблица реальных дел (а не виртуальных) измененных по паттерну
  // хранятся как будущие так прошедшие дела
  await db.schema
    .createTable('things_recurrence_overrides')
    .addColumn('id', 'bigint', (col) => col.notNull().generatedByDefaultAsIdentity())
    // ID повторяющегося дела (мастер событие, родитель), может существовать без родителя
    // нужно сохранять эти дела даже после удаления мастер события по этому тут нет связи
    .addColumn('thing_id', 'bigint', (col) => col.notNull())
    // Нет связи с сервисом account
    .addColumn('user_id', 'integer', (col) => col.notNull())
    // Имя дела
    .addColumn('name', 'varchar(256)', (col) => col.notNull())
    // Описание с поддержкой Wysiwyg
    .addColumn('description', 'text')
    // Приоритетность 1 - важнейшее, 4 - самое не важное
    .addColumn('priority', 'smallint', (col) => col.notNull().defaultTo(4))
    // Вес дела для расчета общего прогресса выполнения
    .addColumn('weight', 'smallint', (col) => col.notNull().defaultTo(100))
    // Причина отмены дела
    .addColumn('cancel_reason', 'text')
    // Дата начала, не фактического
    .addColumn('start_date', 'timestamptz', (col) => col.notNull())
    // Дата фактического окончания
    .addColumn('end_date', 'timestamptz')
    // Дата к какой дате хотелось бы завершить дело
    .addColumn('deadline', 'timestamptz')
    // Статус дела
    .addColumn('status_id', 'smallint', (col) => col.notNull())
    // Тип оверрайда, по какой причине была перезапись
    .addColumn('override_type_id', 'smallint', (col) => col.notNull())

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))

    .addCheckConstraint('tro_priority_check', sql`priority is null or priority in (1, 2, 3, 4)`)
    .addCheckConstraint('tro_weight_check', sql`weight is null or weight between 0 and 100`)

    .addPrimaryKeyConstraint('tro_pkey', ['id', 'thing_id', 'start_date'])
    .execute();
  await setUpdateTriggerOnUpdatedAt('things_recurrence_overrides', db);

  //  === Словари ===
  await db.schema
    .createTable('things_recurrence_override_types')
    .addColumn('id', 'smallint', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(150)', (col) => col.notNull().unique())
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('things_recurrence_overrides')
    .addForeignKeyConstraint(
      'tro_thing_statuses_status_id_fk',
      ['status_id'],
      'thing_statuses',
      ['id'],
      (cb) => cb.onDelete('no action').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('things_recurrence_overrides')
    .addForeignKeyConstraint(
      'tro_tro_types_override_type_id_fk',
      ['override_type_id'],
      'things_recurrence_override_types',
      ['id'],
      (cb) => cb.onDelete('no action').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('things_recurrence_overrides').execute();
  await db.schema.dropTable('things_recurrence_override_types').execute();
}
