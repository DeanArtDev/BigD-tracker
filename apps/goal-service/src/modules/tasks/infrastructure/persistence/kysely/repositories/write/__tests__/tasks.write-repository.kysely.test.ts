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
            "t"."id" as "id",
            "t"."user_id" as "user_id",
            "t"."name" as "name",
            "t"."description" as "description",
            "t"."priority" as "priority",
            "t"."weight" as "weight",
            "t"."cancel_reason" as "cancel_reason",
            "t"."start_date" as "start_date",
            "t"."end_date" as "end_date",
            "t"."deadline" as "deadline",
            "t"."recurrence" as "recurrence",
            "ts"."name" as "status",
            "task_to_group"."group_id" as "group_id"
          from "tasks" as "t"
          inner join "task_statuses" as "ts"
            on "t"."status_id" = "ts"."id"
          left join "task_to_group"
            on "task_to_group"."task_id" = "t"."id"
          where
            "t"."id" = $1
            and "t"."user_id" = $2
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
              name: 'Task name',
              description: null,
              priority: 2,
              weight: 1,
              cancel_reason: null,
              start_date: null,
              end_date: null,
              deadline: null,
              recurrence: null,
            },
          ],
        });

        await repository.createTask(getTask({ id: 11, userId: 77, status: TaskStatus.NOT_STARTED }));

        expect(recorder.queries).toHaveLength(2);
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
          insert into "tasks"
            (
              "name",
              "user_id",
              "priority",
              "recurrence",
              "status_id"
            )
          values
            ($1, $2, $3, $4, $5)
          returning
            "id",
            "user_id",
            "name",
            "description",
            "priority",
            "weight",
            "cancel_reason",
            "start_date",
            "end_date",
            "deadline",
            "recurrence"
        `,
          parameters: ['Task name', 77, 2, null, 1],
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
          rows: [
            {
              id: 11,
              user_id: 77,
              name: 'Task name',
              description: null,
              priority: 2,
              weight: 1,
              cancel_reason: null,
              start_date: null,
              end_date: null,
              deadline: null,
              recurrence: null,
            },
          ],
        });

        await repository.replaceTask(getTask({ id: 11, userId: 77, status: TaskStatus.IN_PROGRESS }));

        expect(recorder.queries).toHaveLength(2);
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
          update "tasks"
          set
            "name" = $1,
            "description" = $2,
            "priority" = $3,
            "weight" = $4,
            "start_date" = $5,
            "deadline" = $6,
            "recurrence" = $7,
            "status_id" = $8
          where
            "id" = $9
            and "user_id" = $10
          returning
            "id",
            "user_id",
            "name",
            "description",
            "priority",
            "weight",
            "cancel_reason",
            "start_date",
            "end_date",
            "deadline",
            "recurrence"
        `,
          parameters: ['Task name', null, 2, 1, null, null, null, 2, 11, 77],
        });
      },
    );
  });

  test('addTaskToGroup returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksWriteRepositoryKysely>(
      (db) => new TasksWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.addTaskToGroup({ groupId: 901, taskId: 11 });

        expect(recorder.queries).toHaveLength(2);

        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            count("task_id") as "count"
          from "task_to_group"
          where "group_id" = $1
        `,
          parameters: [901],
        });

        expectSqlQuery(recorder.queries[1], {
          sql: `
          insert into "task_to_group"
            ("group_id", "task_id", "position")
          values
            ($1, $2, $3)
        `,
          parameters: [901, 11, 0],
        });
      },
    );
  });

  test('removeTaskFromGroup returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksWriteRepositoryKysely>(
      (db) => new TasksWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.removeTaskFromGroup({ taskId: 11 });

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          delete from "task_to_group"
          where "task_id" = $1
          returning
            "position",
            "group_id"
        `,
          parameters: [11],
        });
      },
    );
  });

  test('changeTaskStatus returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksWriteRepositoryKysely>(
      (db) => new TasksWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({
          rows: [{ id: 3, name: TaskStatus.COMPLETED }],
        });
        await repository.changeTaskStatus(getTask({ id: 11, userId: 77, status: TaskStatus.COMPLETED }));

        expect(recorder.queries).toHaveLength(2);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "id",
            task_statuses.name as "name"
          from "task_statuses"
          where "task_statuses"."name" in ($1)
        `,
          parameters: [TaskStatus.COMPLETED],
        });
        expectSqlQuery(recorder.queries[1], {
          sql: `
          update "tasks"
          set "status_id" = $1
          where
            "id" = $2
            and "user_id" = $3
        `,
          parameters: [3, 11, 77],
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
