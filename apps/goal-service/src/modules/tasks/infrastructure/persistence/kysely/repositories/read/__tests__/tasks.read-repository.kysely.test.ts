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
            task_statuses.name as "status",
            "task_to_group"."group_id" as "group_id",
            "task_to_group"."task_id" as "group_task_id",
            "task_to_group"."position" as "position",
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
          left join "task_to_group"
            on "task_to_group"."task_id" = "tasks"."id"
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
            task_statuses.name as "status",
            "task_to_group"."group_id" as "group_id",
            "task_to_group"."task_id" as "group_task_id",
            "task_to_group"."position" as "position",
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
          left join "task_to_group"
            on "task_to_group"."task_id" = "tasks"."id"
          left join "tasks_recurrences"
            on "tasks_recurrences"."task_id" = "tasks"."id"
          left join "recurrences_frequencies"
            on "tasks_recurrences"."recurrence_frequencies_id" = "recurrences_frequencies"."id"
          left join "recurrence_statuses"
            on "tasks_recurrences"."recurrence_status_id" = "recurrence_statuses"."id"
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
          left join "task_to_group"
            on "task_to_group"."task_id" = "tasks"."id"
          left join "tasks_recurrences"
            on "tasks_recurrences"."task_id" = "tasks"."id"
          left join "recurrences_frequencies"
            on "tasks_recurrences"."recurrence_frequencies_id" = "recurrences_frequencies"."id"
          left join "recurrence_statuses"
            on "tasks_recurrences"."recurrence_status_id" = "recurrence_statuses"."id"
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
