import { setUpdateTriggerOnUpdatedAt } from './helpers';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Таблица реальных дел (а не виртуальных) измененных по паттерну
  // хранятся как будущие так прошедшие дела
  await db.schema
    .createTable('tasks_recurrences_overrides')
    .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    // Нет связи с сервисом account
    .addColumn('user_id', 'integer', (col) => col.notNull())
    // Дело может быть только в одной группе
    .addColumn('group_id', 'integer')
    // Имя дела
    .addColumn('name', 'varchar(256)', (col) => col.notNull())
    // Связь к какому паттерну повторений относится
    .addColumn('recurrence_id', 'integer', (col) => col.notNull())
    // Точка во времени, которая определяет для какого виртуального времени произошло изменение
    .addColumn('recurrence_start', 'timestamptz', (col) => col.notNull())
    // Описание с поддержкой Wysiwyg
    .addColumn('description', 'text')
    // Приоритетность 1 - важнейшее, 4 - самое не важное
    .addColumn('priority', 'smallint', (col) => col.notNull().defaultTo(4))
    // Вес дела для расчета общего прогресса выполнения
    .addColumn('weight', 'smallint', (col) => col.notNull().defaultTo(100))
    // Причина отмены дела
    .addColumn('cancel_reason', 'text')
    // Дата и время заменяемого дела "2026-12-31 15:20" абсолютный момент времени
    .addColumn('start_date', 'timestamptz', (col) => col.notNull())
    // Дата к какой дате хотелось бы завершить дело, 2026-12-31 15:20 абсолютный момент времени
    .addColumn('deadline', 'timestamptz')
    // Дата фактического окончания
    .addColumn('end_date', 'timestamptz')
    // Статус дела
    .addColumn('status_id', 'smallint', (col) => col.notNull())
    // Тип оверрайда, по какой причине была перезапись
    .addColumn('override_type_id', 'smallint', (col) => col.notNull())

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))

    .addUniqueConstraint('tasks_recurrences_override_r_id_r_start_unique', ['recurrence_id', 'recurrence_start'])

    .addCheckConstraint('tro_priority_check', sql`priority in (1, 2, 3, 4)`)
    .addCheckConstraint('tro_weight_check', sql`weight between 0 and 100`)
    .addCheckConstraint('tro_deadline_after_start', sql`end_date is null or deadline > start_date`)
    .execute();
  await setUpdateTriggerOnUpdatedAt('tasks_recurrences_overrides', db);

  await db.schema
    // Таблица для хранения информации о повторяющихся делах, которые не являются оверрайдами,
    // а именно мастер события, родитель для серии повторяющихся дел
    .createTable('tasks_recurrences')
    .addColumn('id', 'integer', (col) => col.generatedByDefaultAsIdentity().primaryKey())
    // ID повторяющегося дела (мастер событие, родитель)

    .addColumn('task_id', 'integer', (col) =>
      col.references('tasks.id').onDelete('cascade').onUpdate('no action').notNull(),
    )

    // Нет связи с сервисом account
    .addColumn('user_id', 'integer', (col) => col.notNull())
    // IANA timezone серии, например Europe/Berlin
    .addColumn('timezone', 'varchar(100)', (col) => col.notNull())

    // Частота повторения, например ежедневно, еженедельно, ежемесячно, ежегодно
    .addColumn('recurrence_frequencies_id', 'smallint', (col) => col.notNull())

    // Частота повторения, например ежедневно, еженедельно, ежемесячно, ежегодно
    .addColumn('recurrence_status_id', 'smallint', (col) => col.notNull())

    // Интервал повторения, например каждые 2 недели, каждые 3 месяца, для еженедельного повторения может быть 1 (каждую неделю),
    // 2 (через неделю), 3 (через две недели) и так далее
    .addColumn('interval', 'smallint')

    // День начала недели для еженедельного повторения, например 0 - воскресенье, 1 - понедельник и так далее
    .addColumn('weekstart', 'smallint', (col) => col.notNull())

    // Дни недели для еженедельного повторения, например [1, 3, 5] - повторение будет происходить по понедельникам, средам и пятницам
    .addColumn('weekdays', sql`integer[]`)

    // Дни месяца для ежемесячного повторения, например [1, 15, 30] - повторение будет происходить 1-го, 15-го и 30-го числа каждого месяца
    .addColumn('monthdays', sql`integer[]`)

    // Месяцы для ежегодного повторения, например [1, 6, 12] - повторение будет происходить в январе, июне и декабре каждого года
    .addColumn('yearmonths', sql`integer[]`)
    // Дата начала повторения как абсолютный момент времени начало дня, например 2026-12-31 12:10
    .addColumn('start_date', 'timestamptz', (col) => col.notNull())
    // Дата окончания повторения серии как абсолютный момент времени,
    // конец дня например 2026-12-31 23:59:59, может быть null, если повторение бессрочное
    .addColumn('until_date', 'timestamptz')
    // Паттерн повторения, например FREQ=WEEKLY;BYDAY=MO,WE,FR
    .addColumn('pattern', 'text', (col) => col.notNull())

    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))

    // Условие на уникальность для предотвращения создания двух паттернов повторения для одной и той же задачи, начинающихся в один и тот же день
    .addUniqueConstraint('tasks_recurrences_task_id_start_date_unique', ['task_id', 'start_date'])

    .addCheckConstraint('tasks_recurrences_until_after_start', sql`until_date is null or until_date >= start_date`)
    .addCheckConstraint('tasks_recurrences_weekstart', sql`weekstart is null or weekstart between 0 and 6`)
    .addCheckConstraint('tasks_recurrences_interval', sql`interval is null or interval between 0 and 1000`)
    .addCheckConstraint(
      'tasks_recurrences_weekdays',
      sql`weekdays is null or weekdays <@ ARRAY[0, 1, 2, 3, 4, 5, 6]::integer[]`,
    )
    .addCheckConstraint(
      'tasks_recurrences_monthdays',
      sql`monthdays is null or monthdays <@ ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]::integer[]`,
    )
    .addCheckConstraint(
      'tasks_recurrences_yearmonths',
      sql`yearmonths is null or yearmonths <@ ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]::integer[]`,
    )
    .execute();
  await setUpdateTriggerOnUpdatedAt('tasks_recurrences', db);

  //  === Индексы ===
  await db.schema
    .createIndex('tro_recurrence_start_date_uidx')
    .on('tasks_recurrences_overrides')
    .columns(['recurrence_id', 'recurrence_start'])
    .unique()
    .execute();

  await db.schema
    .createIndex('tasks_recurrences_user_start_until_idx')
    .on('tasks_recurrences')
    .columns(['user_id', 'start_date', 'until_date'])
    .execute();

  //  === Словари ===
  await db.schema
    .createTable('tasks_recurrences_override_types')
    .addColumn('id', 'smallint', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(50)', (col) => col.notNull().unique())
    .execute();

  await db.schema
    .createTable('recurrences_frequencies')
    .addColumn('id', 'smallint', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(50)', (col) => col.notNull().unique())
    .execute();

  await db.schema
    .createTable('recurrence_statuses')
    .addColumn('id', 'smallint', (col) => col.primaryKey().generatedByDefaultAsIdentity())
    .addColumn('name', 'varchar(50)', (col) => col.notNull().unique())
    .execute();

  // === Внешние ключи таблиц ===
  await db.schema
    .alterTable('tasks_recurrences_overrides')
    .addForeignKeyConstraint('tro_task_statuses_status_id_fk', ['status_id'], 'task_statuses', ['id'], (cb) =>
      cb.onDelete('no action').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('tasks_recurrences_overrides')
    .addForeignKeyConstraint('tro_tasks_recurrences_fk', ['recurrence_id'], 'tasks_recurrences', ['id'], (cb) =>
      cb.onDelete('cascade').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('tasks_recurrences')
    .addForeignKeyConstraint(
      'tr_frequencies_fk',
      ['recurrence_frequencies_id'],
      'recurrences_frequencies',
      ['id'],
      (cb) => cb.onDelete('no action').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('tasks_recurrences_overrides')
    .addForeignKeyConstraint(
      'tro_tro_types_override_type_id_fk',
      ['override_type_id'],
      'tasks_recurrences_override_types',
      ['id'],
      (cb) => cb.onDelete('no action').onUpdate('no action'),
    )
    .execute();

  await db.schema
    .alterTable('tasks_recurrences')
    .addForeignKeyConstraint('tr_status_fk', ['recurrence_status_id'], 'recurrence_statuses', ['id'], (cb) =>
      cb.onDelete('no action').onUpdate('no action'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('tasks_recurrences_overrides').execute();
  await db.schema.dropTable('tasks_recurrences').execute();
  await db.schema.dropTable('tasks_recurrences_override_types').execute();
}
