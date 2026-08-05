import { TasksDB } from '@/modules/tasks/application/ports';
import { TaskStatus } from '@big-d/api-contracts';
import { expectSqlQuery, withRepository } from '@shared/__tests__';
import { getTask } from '@shared/__tests__/entities';
import { TasksWriteRepositoryKysely } from '../tasks.write-repository.kysely';

describe('TasksWriteRepositoryKysely', () => {
  test('getTaskById returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksWriteRepositoryKysely>(
      (db) => new TasksWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.getTaskById({ taskId: 11, userId: 77 });

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "tasks"."id" as "id",
            "tasks"."user_id" as "user_id",
            "tasks"."group_id" as "group_id",
            "tasks"."name" as "name",
            "tasks"."description" as "description",
            "tasks"."priority" as "priority",
            "tasks"."cancel_reason" as "cancel_reason",
            "tasks"."start_date" as "start_date",
            "tasks"."end_date" as "end_date",
            "tasks"."deadline" as "deadline",
            task_statuses.name as "status",
            "tasks_recurrences"."id" as "recurrence_id",
            "tasks_recurrences"."user_id" as "recurrence_user_id",
            "tasks_recurrences"."task_id" as "recurrence_task_id",
            "tasks_recurrences"."start_date" as "recurrence_start_date",
            "tasks_recurrences"."until_date" as "recurrence_until_date",
            "tasks_recurrences"."interval" as "recurrence_interval",
            "tasks_recurrences"."monthdays" as "recurrence_monthdays",
            "tasks_recurrences"."yearmonths" as "recurrence_yearmonths",
            "tasks_recurrences"."timezone" as "recurrence_timezone",
            "tasks_recurrences"."pattern" as "recurrence_pattern",
            recurrence_statuses.name as "recurrence_status",
            recurrences_frequencies.name as "recurrence_frequency",
            tasks_recurrences.weekstart as "recurrence_weekstart",
            tasks_recurrences.weekdays as "recurrence_weekdays"
          from "tasks"
          inner join "task_statuses"
            on "tasks"."status_id" = "task_statuses"."id"
          left join "tasks_recurrences"
            on "tasks_recurrences"."task_id" = "tasks"."id"
          left join "recurrences_frequencies"
            on "tasks_recurrences"."recurrence_frequencies_id" = "recurrences_frequencies"."id"
          left join "recurrence_statuses"
            on "tasks_recurrences"."recurrence_status_id" = "recurrence_statuses"."id"
          where
            "tasks"."id" = $1
            and "tasks"."user_id" = $2
        `,
          parameters: [11, 77],
        });
      },
    );
  });

  test('createTask returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksWriteRepositoryKysely>(
      (db) => new TasksWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({
          rows: [{ id: 1, name: TaskStatus.NOT_STARTED }],
        });
        recorder.enqueueResult({
          rows: [
            {
              id: 11,
              user_id: 77,
              group_id: null,
              name: 'Task name',
              description: null,
              priority: 2,
              cancel_reason: null,
              start_date: null,
              end_date: null,
              deadline: null,
              recurrence: null,
            },
          ],
        });
        recorder.enqueueResult({ numAffectedRows: 1n });

        await repository.createTask(getTask({ id: 11, userId: 77, status: TaskStatus.NOT_STARTED }));

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
          insert into "tasks" ("name", "user_id", "priority", "status_id")
          values ($1, $2, $3, $4)
          returning
            "id",
            "user_id",
            "group_id",
            "name",
            "description",
            "priority",
            "cancel_reason",
            "start_date",
            "end_date",
            "deadline"
        `,
          parameters: ['Task name', 77, 2, 1],
        });
        expectSqlQuery(recorder.queries[2], {
          sql: `
          insert into "task_settings" ("task_id", "icon", "is_all_day")
          values ($1, $2, $3)
        `,
          parameters: [11, null, false],
        });
      },
    );
  });

  test('updateSettings returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksWriteRepositoryKysely>(
      (db) => new TasksWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({ numAffectedRows: 1n });

        const result = await repository.updateSettings({
          taskId: 42,
          patch: { icon: null, isAllDay: true },
        });

        expect(result).toBe(true);
        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          update "task_settings"
          set
            "icon" = $1,
            "is_all_day" = $2
          where "task_id" = $3
        `,
          parameters: [null, true, 42],
        });
      },
    );
  });

  test('createTask with group returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksWriteRepositoryKysely>(
      (db) => new TasksWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({
          rows: [{ id: 1, name: TaskStatus.NOT_STARTED }],
        });
        recorder.enqueueResult({
          rows: [
            {
              id: 11,
              user_id: 77,
              group_id: 9,
              name: 'Task name',
              description: null,
              priority: 2,
              cancel_reason: null,
              start_date: null,
              end_date: null,
              deadline: null,
              recurrence: null,
            },
          ],
        });
        recorder.enqueueResult({ numAffectedRows: 1n });
        recorder.enqueueResult({
          rows: [],
        });
        recorder.enqueueResult({
          rows: [{ count: '2' }],
        });
        recorder.enqueueResult({
          rows: [],
        });

        await repository.createTask(getTask({ id: 11, userId: 77, groupId: 9, status: TaskStatus.NOT_STARTED }));

        expect(recorder.queries).toHaveLength(6);
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
          insert into "tasks" ("name", "user_id", "group_id", "priority", "status_id")
          values ($1, $2, $3, $4, $5)
          returning
            "id",
            "user_id",
            "group_id",
            "name",
            "description",
            "priority",
            "cancel_reason",
            "start_date",
            "end_date",
            "deadline"
        `,
          parameters: ['Task name', 77, 9, 2, 1],
        });
        expectSqlQuery(recorder.queries[2], {
          sql: `
          insert into "task_settings" ("task_id", "icon", "is_all_day")
          values ($1, $2, $3)
        `,
          parameters: [11, null, false],
        });
        expectSqlQuery(recorder.queries[3], {
          sql: `
          select
            "group_id",
            "position"
          from "task_to_group"
          where "task_id" = $1
        `,
          parameters: [11],
        });
        expectSqlQuery(recorder.queries[4], {
          sql: `
          select count("task_id") as "count"
          from "task_to_group"
          where "group_id" = $1
        `,
          parameters: [9],
        });
        expectSqlQuery(recorder.queries[5], {
          sql: `
          insert into "task_to_group" ("group_id", "task_id", "position")
          values ($1, $2, $3)
        `,
          parameters: [9, 11, 2],
        });
      },
    );
  });

  test('replaceTask returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksWriteRepositoryKysely>(
      (db) => new TasksWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({
          rows: [{ id: 2, name: TaskStatus.IN_PROGRESS }],
        });
        recorder.enqueueResult({
          rows: [],
        });
        recorder.enqueueResult({
          rows: [],
        });
        recorder.enqueueResult({
          rows: [
            {
              id: 11,
              user_id: 77,
              group_id: null,
              name: 'Task name',
              description: null,
              priority: 2,
              cancel_reason: null,
              start_date: null,
              end_date: null,
              deadline: null,
              recurrence: null,
            },
          ],
        });

        await repository.replaceTask(getTask({ id: 11, userId: 77, status: TaskStatus.IN_PROGRESS }));

        expect(recorder.queries).toHaveLength(5);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "id",
            task_statuses.name as "name"
          from "task_statuses"
          where "task_statuses"."name" in ($1)
        `,
          parameters: [TaskStatus.IN_PROGRESS],
        });
        expectSqlQuery(recorder.queries[1], {
          sql: `
          select
            "group_id",
            "position"
          from "task_to_group"
          where "task_id" = $1
        `,
          parameters: [11],
        });
        expectSqlQuery(recorder.queries[2], {
          sql: `
          delete from "task_to_group"
          where "task_id" = $1
          returning
            "position",
            "group_id"
        `,
          parameters: [11],
        });
        expectSqlQuery(recorder.queries[3], {
          sql: `
          update "tasks"
          set
            "name" = $1,
            "description" = $2,
            "group_id" = $3,
            "priority" = $4,
            "start_date" = $5,
            "deadline" = $6,
            "cancel_reason" = $7,
            "status_id" = $8
          where
            "id" = $9
            and "user_id" = $10
          returning
            "id",
            "user_id",
            "group_id",
            "name",
            "description",
            "priority",
            "cancel_reason",
            "start_date",
            "end_date",
            "deadline"
        `,
          parameters: ['Task name', null, null, 2, null, null, null, 2, 11, 77],
        });
        expectSqlQuery(recorder.queries[4], {
          sql: `
          select
            "tasks_recurrences"."id"
          from "tasks_recurrences"
          where "tasks_recurrences"."task_id" = $1
        `,
          parameters: [11],
        });
      },
    );
  });

  test('replaceTask with group move returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksWriteRepositoryKysely>(
      (db) => new TasksWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({
          rows: [{ id: 2, name: TaskStatus.IN_PROGRESS }],
        });
        recorder.enqueueResult({
          rows: [{ group_id: 3, position: 1 }],
        });
        recorder.enqueueResult({
          rows: [],
        });
        recorder.enqueueResult({
          rows: [{ count: '4' }],
        });
        recorder.enqueueResult({
          rows: [],
        });
        recorder.enqueueResult({
          rows: [
            {
              id: 11,
              user_id: 77,
              group_id: 9,
              name: 'Task name',
              description: null,
              priority: 2,
              cancel_reason: null,
              start_date: null,
              end_date: null,
              deadline: null,
              recurrence: null,
            },
          ],
        });
        recorder.enqueueResult({
          rows: [],
        });

        await repository.replaceTask(getTask({ id: 11, userId: 77, groupId: 9, status: TaskStatus.IN_PROGRESS }));

        expect(recorder.queries).toHaveLength(7);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "id",
            task_statuses.name as "name"
          from "task_statuses"
          where "task_statuses"."name" in ($1)
        `,
          parameters: [TaskStatus.IN_PROGRESS],
        });
        expectSqlQuery(recorder.queries[1], {
          sql: `
          select
            "group_id",
            "position"
          from "task_to_group"
          where "task_id" = $1
        `,
          parameters: [11],
        });
        expectSqlQuery(recorder.queries[2], {
          sql: `
          update "task_to_group"
          set "position" = "position" - $1
          where
            "group_id" = $2
            and "position" > $3
        `,
          parameters: [1, 3, 1],
        });
        expectSqlQuery(recorder.queries[3], {
          sql: `
          select count("task_id") as "count"
          from "task_to_group"
          where "group_id" = $1
        `,
          parameters: [9],
        });
        expectSqlQuery(recorder.queries[4], {
          sql: `
          update "task_to_group"
          set
            "group_id" = $1,
            "position" = $2
          where "task_id" = $3
        `,
          parameters: [9, 4, 11],
        });
        expectSqlQuery(recorder.queries[5], {
          sql: `
          update "tasks"
          set
            "name" = $1,
            "description" = $2,
            "group_id" = $3,
            "priority" = $4,
            "start_date" = $5,
            "deadline" = $6,
            "cancel_reason" = $7,
            "status_id" = $8
          where
            "id" = $9
            and "user_id" = $10
          returning
            "id",
            "user_id",
            "group_id",
            "name",
            "description",
            "priority",
            "cancel_reason",
            "start_date",
            "end_date",
            "deadline"
        `,
          parameters: ['Task name', null, 9, 2, null, null, null, 2, 11, 77],
        });
        expectSqlQuery(recorder.queries[6], {
          sql: `
          select
            "tasks_recurrences"."id"
          from "tasks_recurrences"
          where "tasks_recurrences"."task_id" = $1
        `,
          parameters: [11],
        });
      },
    );
  });

  test('deleteTask returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksWriteRepositoryKysely>(
      (db) => new TasksWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({
          numAffectedRows: 1n,
        });
        await repository.deleteTask({ taskId: 11, userId: 77 });

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          delete from "tasks"
          where
            "id" = $1
            and "user_id" = $2
        `,
          parameters: [11, 77],
        });
      },
    );
  });
});
