import { TasksDB } from '@/modules/tasks/application/ports';
import {
  TaskOverrideByStartGreaterOrEqual,
  TaskOverrideByStartLessOrEqual,
  TaskOverrideByUserId,
  TaskRecurrenceById,
  TaskRecurrenceByTaskId,
  TaskRecurrenceByUserId,
  tasksCombinators,
} from '@/modules/tasks/application/specifications';
import { TaskOverrideFactory, TaskRecurrenceFactory } from '@/modules/tasks/domain';
import { RecurrenceFrequency, TaskOverrideType, TaskRecurrenceWeekday, TaskStatus } from '@big-d/api-contracts';
import { expectSqlQuery, withRepository } from '@shared/__tests__';
import { getTask } from '@shared/__tests__/entities';
import { TasksOverridesWriteRepositoryKysely } from '../tasks-overrides.write-repository.kysely';

describe('TasksOverridesWriteRepositoryKysely', () => {
  test('getManyRecurrences returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksOverridesWriteRepositoryKysely>(
      (db) => new TasksOverridesWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const specification = tasksCombinators.and(TaskRecurrenceByUserId(77), TaskRecurrenceByTaskId(11));

        await repository.getManyRecurrences(specification);

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "tasks_recurrences"."id" as "id",
            "tasks_recurrences"."user_id" as "user_id",
            "tasks_recurrences"."task_id" as "task_id",
            "tasks_recurrences"."start_date" as "start_date",
            "tasks_recurrences"."until_date" as "until_date",
            "tasks_recurrences"."interval" as "interval",
            "tasks_recurrences"."weekdays" as "weekdays",
            "tasks_recurrences"."weekstart" as "weekstart",
            "tasks_recurrences"."monthdays" as "monthdays",
            "tasks_recurrences"."yearmonths" as "yearmonths",
            "tasks_recurrences"."timezone" as "timezone",
            "tasks_recurrences"."pattern" as "pattern",
            recurrences_frequencies.name as "recurrence_frequency",
            tasks_recurrences.weekstart as "weekstart",
            tasks_recurrences.weekdays as "weekdays"
          from "tasks_recurrences"
          inner join "recurrences_frequencies"
            on "tasks_recurrences"."recurrence_frequencies_id" = "recurrences_frequencies"."id"
          where
            (
              "tasks_recurrences"."user_id" = $1
              and "tasks_recurrences"."task_id" = $2
            )
        `,
          parameters: [77, 11],
        });
      },
    );
  });

  test('getOneRecurrence returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksOverridesWriteRepositoryKysely>(
      (db) => new TasksOverridesWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const specification = tasksCombinators.and(TaskRecurrenceByUserId(77), TaskRecurrenceById(11));

        await repository.getOneRecurrence(specification);

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "tasks_recurrences"."id" as "id",
            "tasks_recurrences"."user_id" as "user_id",
            "tasks_recurrences"."task_id" as "task_id",
            "tasks_recurrences"."start_date" as "start_date",
            "tasks_recurrences"."until_date" as "until_date",
            "tasks_recurrences"."interval" as "interval",
            "tasks_recurrences"."weekdays" as "weekdays",
            "tasks_recurrences"."weekstart" as "weekstart",
            "tasks_recurrences"."monthdays" as "monthdays",
            "tasks_recurrences"."yearmonths" as "yearmonths",
            "tasks_recurrences"."timezone" as "timezone",
            "tasks_recurrences"."pattern" as "pattern",
            recurrences_frequencies.name as "recurrence_frequency",
            tasks_recurrences.weekstart as "weekstart",
            tasks_recurrences.weekdays as "weekdays"
          from "tasks_recurrences"
          inner join "recurrences_frequencies"
            on "tasks_recurrences"."recurrence_frequencies_id" = "recurrences_frequencies"."id"
          where
            (
              "tasks_recurrences"."user_id" = $1
              and "tasks_recurrences"."id" = $2
            )
        `,
          parameters: [77, 11],
        });
      },
    );
  });

  test('getManyOverrides returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksOverridesWriteRepositoryKysely>(
      (db) => new TasksOverridesWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const from = new Date('2026-01-01T00:00:00.000Z');
        const to = new Date('2026-01-31T23:59:59.000Z');
        const specification = tasksCombinators.and(
          TaskOverrideByUserId(77),
          TaskOverrideByStartGreaterOrEqual(from),
          TaskOverrideByStartLessOrEqual(to),
        );

        await repository.getManyOverrides(specification);

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "tasks_recurrences_overrides"."id" as "id",
            "tasks_recurrences_overrides"."recurrence_id" as "recurrence_id",
            "tasks_recurrences_overrides"."user_id" as "user_id",
            "tasks_recurrences_overrides"."name" as "name",
            "tasks_recurrences_overrides"."description" as "description",
            "tasks_recurrences_overrides"."priority" as "priority",
            "tasks_recurrences_overrides"."weight" as "weight",
            "tasks_recurrences_overrides"."cancel_reason" as "cancel_reason",
            "tasks_recurrences_overrides"."start_date" as "start_date",
            "tasks_recurrences_overrides"."end_date" as "end_date",
            "tasks_recurrences_overrides"."deadline" as "deadline",
            "tasks_recurrences_overrides"."recurrence_start" as "recurrence_start",
            task_statuses.name as "status",
            tasks_recurrences_override_types.name as "override_type"
          from "tasks_recurrences_overrides"
          inner join "task_statuses"
            on "tasks_recurrences_overrides"."status_id" = "task_statuses"."id"
          inner join "tasks_recurrences_override_types"
            on "tasks_recurrences_override_types"."id" = "tasks_recurrences_overrides"."override_type_id"
          where
            (
              "tasks_recurrences_overrides"."user_id" = $1
              and "tasks_recurrences_overrides"."recurrence_start" >= $2
              and "tasks_recurrences_overrides"."recurrence_start" <= $3
            )
        `,
          parameters: [77, from, to],
        });
      },
    );
  });

  test('upsertRecurrence returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksOverridesWriteRepositoryKysely>(
      (db) => new TasksOverridesWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({
          rows: [{ id: 1, name: 'DAILY' }],
        });
        recorder.enqueueResult({
          rows: [
            {
              id: 25,
              user_id: 77,
              task_id: 11,
              timezone: 'UTC',
              start_date: new Date('2026-01-10T10:00:00.000Z'),
              until_date: null,
              interval: null,
              weekdays: null,
              weekstart: TaskRecurrenceWeekday.MO,
              monthdays: null,
              yearmonths: null,
              pattern: 'FREQ=DAILY;INTERVAL=1',
              recurrence_frequencies_id: 1,
            },
          ],
        });

        const recurrence = TaskRecurrenceFactory.create({
          userId: 77,
          taskId: 11,
          timezone: 'UTC',
          startDate: '2026-01-10T10:00:00.000Z',
          pattern: 'FREQ=DAILY;INTERVAL=1',
          frequency: RecurrenceFrequency.DAILY,
          weekstart: TaskRecurrenceWeekday.MO,
        });

        await repository.upsertRecurrence(recurrence);

        expect(recorder.queries).toHaveLength(2);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "id",
            recurrences_frequencies.name as "name"
          from "recurrences_frequencies"
          where "recurrences_frequencies"."name" in ($1)
        `,
          parameters: ['DAILY'],
        });
        expectSqlQuery(recorder.queries[1], {
          sql: `
          insert into "tasks_recurrences"
            (
              "user_id",
              "task_id",
              "pattern",
              "start_date",
              "timezone",
              "weekstart",
              "recurrence_frequencies_id"
            )
          values
            ($1, $2, $3, $4, $5, $6, $7)
          on conflict ("id")
          do update set
            "pattern" = $8,
            "start_date" = $9,
            "weekstart" = $10,
            "recurrence_frequencies_id" = $11
          returning *
        `,
          parameters: [
            77,
            11,
            'FREQ=DAILY;INTERVAL=1',
            '2026-01-10T10:00:00.000Z',
            'UTC',
            TaskRecurrenceWeekday.MO,
            1,
            'FREQ=DAILY;INTERVAL=1',
            '2026-01-10T10:00:00.000Z',
            TaskRecurrenceWeekday.MO,
            1,
          ],
        });
      },
    );
  });

  test('upsertOverride returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksOverridesWriteRepositoryKysely>(
      (db) => new TasksOverridesWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({
          rows: [{ id: 1, name: TaskStatus.NOT_STARTED }],
        });
        recorder.enqueueResult({
          rows: [{ id: 1, name: TaskOverrideType.OVERRIDE }],
        });
        recorder.enqueueResult({
          rows: [
            {
              id: 15,
              weight: 1,
              recurrence_id: 21,
              cancel_reason: null,
              name: 'Task name',
              deadline: null,
              end_date: null,
              start_date: new Date('2026-01-10T10:00:00.000Z'),
              description: null,
              user_id: 77,
              priority: 2,
              override_type_id: 1,
              recurrence_start: new Date('2026-01-10T10:00:00.000Z'),
            },
          ],
        });

        const override = TaskOverrideFactory.create({
          task: getTask({
            id: 11,
            userId: 77,
            status: TaskStatus.NOT_STARTED,
            startDate: '2026-01-10T10:00:00.000Z',
          }),
          type: TaskOverrideType.OVERRIDE,
          recurrenceId: 21,
          recurrenceStart: '2026-01-10T10:00:00.000Z',
        });

        await repository.upsertOverride(override);

        expect(recorder.queries).toHaveLength(3);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "id",
            task_statuses.name as "name"
          from "task_statuses"
          where "task_statuses"."name" in ($1)
        `,
          parameters: [TaskStatus.NOT_STARTED],
        });
        expectSqlQuery(recorder.queries[1], {
          sql: `
          select
            "id",
            tasks_recurrences_override_types.name as "name"
          from "tasks_recurrences_override_types"
          where "tasks_recurrences_override_types"."name" in ($1)
        `,
          parameters: [TaskOverrideType.OVERRIDE],
        });
        expectSqlQuery(recorder.queries[2], {
          sql: `
          insert into "tasks_recurrences_overrides"
            (
              "recurrence_id",
              "name",
              "start_date",
              "user_id",
              "priority",
              "status_id",
              "weight",
              "override_type_id",
              "recurrence_start"
            )
          values
            ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          on conflict ("recurrence_id", "recurrence_start")
          do update set
            "name" = $10,
            "start_date" = $11,
            "priority" = $12,
            "status_id" = $13,
            "weight" = $14,
            "override_type_id" = $15,
            "recurrence_start" = $16
          returning
            "id",
            "weight",
            "recurrence_id",
            "cancel_reason",
            "name",
            "deadline",
            "end_date",
            "start_date",
            "description",
            "user_id",
            "priority",
            "override_type_id",
            "recurrence_start"
        `,
          parameters: [
            21,
            'Task name',
            '2026-01-10T10:00:00.000Z',
            77,
            2,
            1,
            1,
            1,
            '2026-01-10T10:00:00.000Z',
            'Task name',
            '2026-01-10T10:00:00.000Z',
            2,
            1,
            1,
            1,
            '2026-01-10T10:00:00.000Z',
          ],
        });
      },
    );
  });
});
