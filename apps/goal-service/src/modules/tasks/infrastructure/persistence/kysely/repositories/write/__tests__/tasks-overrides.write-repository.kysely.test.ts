import { TasksDB } from '@/modules/tasks/application/ports';
import {
  TaskById,
  TaskByStatus,
  TaskByUserId,
  TaskOverrideByOccurrenceStartGreaterOrEqual,
  TaskOverrideByOccurrenceStartLessOrEqual,
  TaskOverrideByUserId,
  tasksCombinators,
} from '@/modules/tasks/application/specifications';
import { TaskOverrideFactory } from '@/modules/tasks/domain';
import { TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { expectSqlQuery, withRepository } from '@shared/__tests__';
import { getTask } from '@shared/__tests__/entities';
import { TasksOverridesWriteRepositoryKysely } from '../tasks-overrides.write-repository.kysely';

describe('TasksOverridesWriteRepositoryKysely', () => {
  test('getManyMasterEvents returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksOverridesWriteRepositoryKysely>(
      (db) => new TasksOverridesWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const specification = tasksCombinators.and(
          TaskByUserId(77),
          TaskByStatus([TaskStatus.NOT_STARTED]),
          TaskById(11),
        );

        await repository.getManyMasterEvents(specification);

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "tasks"."id" as "id",
            "tasks"."user_id" as "user_id",
            "tasks"."name" as "name",
            "tasks"."description" as "description",
            "tasks"."priority" as "priority",
            "tasks"."weight" as "weight",
            "tasks"."cancel_reason" as "cancel_reason",
            "tasks"."start_date" as "start_date",
            "tasks"."end_date" as "end_date",
            "tasks"."deadline" as "deadline",
            "tasks"."recurrence" as "recurrence",
            task_statuses.name as "status"
          from "tasks"
          inner join "task_statuses"
            on "tasks"."status_id" = "task_statuses"."id"
          where
            (
              "tasks"."user_id" = $1
              and "task_statuses"."name" in ($2)
              and "tasks"."id" = $3
            )
        `,
          parameters: [77, TaskStatus.NOT_STARTED, 11],
        });
      },
    );
  });

  test('getOneMasterEvent returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksOverridesWriteRepositoryKysely>(
      (db) => new TasksOverridesWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const specification = tasksCombinators.and(TaskByUserId(77), TaskById(11));

        await repository.getOneMasterEvent(specification);

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "tasks"."id" as "id",
            "tasks"."user_id" as "user_id",
            "tasks"."name" as "name",
            "tasks"."description" as "description",
            "tasks"."priority" as "priority",
            "tasks"."weight" as "weight",
            "tasks"."cancel_reason" as "cancel_reason",
            "tasks"."start_date" as "start_date",
            "tasks"."end_date" as "end_date",
            "tasks"."deadline" as "deadline",
            "tasks"."recurrence" as "recurrence",
            task_statuses.name as "status"
          from "tasks"
          inner join "task_statuses"
            on "tasks"."status_id" = "task_statuses"."id"
          where
            (
              "tasks"."user_id" = $1
              and "tasks"."id" = $2
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
          TaskOverrideByOccurrenceStartGreaterOrEqual(from),
          TaskOverrideByOccurrenceStartLessOrEqual(to),
        );

        await repository.getManyOverrides(specification);

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "tasks_recurrence_overrides"."id" as "id",
            "tasks_recurrence_overrides"."user_id" as "user_id",
            "tasks_recurrence_overrides"."name" as "name",
            "tasks_recurrence_overrides"."description" as "description",
            "tasks_recurrence_overrides"."priority" as "priority",
            "tasks_recurrence_overrides"."weight" as "weight",
            "tasks_recurrence_overrides"."cancel_reason" as "cancel_reason",
            "tasks_recurrence_overrides"."start_date" as "start_date",
            "tasks_recurrence_overrides"."end_date" as "end_date",
            "tasks_recurrence_overrides"."deadline" as "deadline",
            "tasks_recurrence_overrides"."task_id" as "task_id",
            "tasks_recurrence_overrides"."occurrence_start" as "occurrence_start",
            task_statuses.name as "status",
            tasks_recurrence_override_types.name as "override_type"
          from "tasks_recurrence_overrides"
          inner join "task_statuses"
            on "tasks_recurrence_overrides"."status_id" = "task_statuses"."id"
          inner join "tasks_recurrence_override_types"
            on "tasks_recurrence_override_types"."id" = "tasks_recurrence_overrides"."override_type_id"
          where
            (
              "tasks_recurrence_overrides"."user_id" = $1
              and "tasks_recurrence_overrides"."occurrence_start" >= $2
              and "tasks_recurrence_overrides"."occurrence_start" <= $3
            )
        `,
          parameters: [77, from, to],
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
              task_id: 11,
              cancel_reason: null,
              name: 'Task name',
              deadline: null,
              end_date: null,
              start_date: new Date('2026-01-10T10:00:00.000Z'),
              description: null,
              user_id: 77,
              priority: 2,
              override_type_id: 1,
              occurrence_start: new Date('2026-01-10T10:00:00.000Z'),
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
          occurrenceStart: '2026-01-10T10:00:00.000Z',
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
            tasks_recurrence_override_types.name as "name"
          from "tasks_recurrence_override_types"
          where "tasks_recurrence_override_types"."name" in ($1)
        `,
          parameters: [TaskOverrideType.OVERRIDE],
        });
        expectSqlQuery(recorder.queries[2], {
          sql: `
          insert into "tasks_recurrence_overrides"
            (
              "task_id",
              "name",
              "start_date",
              "user_id",
              "priority",
              "status_id",
              "weight",
              "override_type_id",
              "occurrence_start"
            )
          values
            ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          on conflict ("task_id", "occurrence_start")
          do update set
            "name" = $10,
            "start_date" = $11,
            "priority" = $12,
            "status_id" = $13,
            "weight" = $14,
            "override_type_id" = $15
          returning
            "id",
            "weight",
            "task_id",
            "cancel_reason",
            "name",
            "deadline",
            "end_date",
            "start_date",
            "description",
            "user_id",
            "priority",
            "override_type_id",
            "occurrence_start"
        `,
          parameters: [
            11,
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
          ],
        });
      },
    );
  });
});
