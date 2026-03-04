import { TasksDB } from '@/modules/tasks/application/ports';
import {
  TaskByDeadlineGreaterOrEqual,
  TaskByStartDateLessOrEqual,
  TaskByStatus,
  TaskByUserId,
  tasksCombinators,
} from '@/modules/tasks/application/specifications';
import { TaskStatus } from '@big-d/api-contracts';
import { expectSqlQuery, withRepository } from '@shared/__tests__';
import { TasksReadRepositoryKysely } from '../tasks.read-repository.kysely';

describe('TasksReadRepositoryKysely', () => {
  test('getById returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksReadRepositoryKysely>(
      (db) => new TasksReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.getById({ userId: 9, id: 111 });

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
          parameters: [111, 9],
        });
      },
    );
  });

  test('isTaskIntoGroup returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksReadRepositoryKysely>(
      (db) => new TasksReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.isTaskIntoGroup({ taskId: 111, groupId: 22 });

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
          from "task_to_group"
          where
            "group_id" = $1
            and "task_id" = $2
        `,
          parameters: [22, 111],
        });
      },
    );
  });

  test('getByRange returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksReadRepositoryKysely>(
      (db) => new TasksReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const from = new Date('2026-01-01T00:00:00.000Z');
        const to = new Date('2026-01-31T23:59:59.000Z');
        const spec = tasksCombinators.and(
          TaskByUserId(9),
          TaskByStatus([TaskStatus.NOT_STARTED]),
          TaskByStartDateLessOrEqual(to),
          TaskByDeadlineGreaterOrEqual(from),
        );

        await repository.getByRange(spec, { page: 1, perPage: 20 });

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select distinct
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
            task_statuses.name as "status",
            "task_to_group"."group_id" as "group_id"
          from "tasks"
          inner join "task_statuses"
            on "tasks"."status_id" = "task_statuses"."id"
          left join "task_to_group"
            on "task_to_group"."task_id" = "tasks"."id"
          where
            (
              "tasks"."user_id" = $1
              and "task_statuses"."name" in ($2)
              and "tasks"."start_date" <= $3
              and "tasks"."deadline" >= $4
            )
          order by "tasks"."id" asc
          limit $5
        `,
          parameters: [9, TaskStatus.NOT_STARTED, to, from, 20],
        });
      },
    );
  });

  test('getMany returns expected sql and params', async () => {
    await withRepository<TasksDB, TasksReadRepositoryKysely>(
      (db) => new TasksReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const spec = tasksCombinators.and(TaskByUserId(9), TaskByStatus([TaskStatus.NOT_STARTED]));

        await repository.getMany(['with_group_links_left_join'], spec);

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
            task_statuses.name as "status",
            "task_to_group"."group_id" as "group_id",
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
            "tasks"."recurrence" as "recurrence"
          from "tasks"
          inner join "task_statuses"
            on "tasks"."status_id" = "task_statuses"."id"
          left join "task_to_group"
            on "task_to_group"."task_id" = "tasks"."id"
          where
            ("tasks"."user_id" = $1 and "task_statuses"."name" in ($2))
          order by "id" asc
        `,
          parameters: [9, TaskStatus.NOT_STARTED],
        });
      },
    );
  });
});
