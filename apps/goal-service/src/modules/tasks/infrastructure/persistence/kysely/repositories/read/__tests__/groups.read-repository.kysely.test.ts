import { TasksDB } from '@/modules/tasks/application/ports';
import {
  GroupById,
  GroupByNameSearch,
  GroupByStatus,
  GroupByUserId,
  groupsCombinators,
} from '@/modules/tasks/application/specifications';
import { groupsQuerySpec } from '@/modules/tasks/domain';
import { DEFAULT_GROUP_SETTINGS } from '@/modules/tasks/domain/constants';
import { GroupStatus, TaskStatus } from '@big-d/api-contracts';
import { expectSqlQuery, withRepository } from '@shared/__tests__';
import { GroupsReadRepositoryKysely } from '../groups.read-repository.kysely';

describe('GroupsReadRepositoryKysely', () => {
  test('getInfoGroups returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupsReadRepositoryKysely>(
      (db) => new GroupsReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const specification = groupsCombinators.and(
          GroupByUserId(7),
          GroupByStatus([GroupStatus.NOT_STARTED]),
          GroupByNameSearch('Team'),
        );

        await repository.getInfoGroups(specification);

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "groups"."id" as "id",
            "groups"."user_id" as "user_id",
            "groups"."description" as "description",
            "groups"."name" as "name",
            "groups"."progress" as "progress",
            group_statuses.name as "status"
          from "groups"
          inner join "group_statuses"
            on "groups"."status_id" = "group_statuses"."id"
          where
            (
              "groups"."user_id" = $1
              and "group_statuses"."name" in ($2)
              and "groups"."name" ilike $3
            )
          order by
            case
              when "groups"."name" = $4 then 0
              else 1
            end
        `,
          parameters: [7, GroupStatus.NOT_STARTED, '%Team%', groupsQuerySpec.inboxName],
        });
      },
    );
  });

  test('getDiaryGroups returns groups having at least one task with dates and puts inbox first', async () => {
    await withRepository<TasksDB, GroupsReadRepositoryKysely>(
      (db) => new GroupsReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.getDiaryGroups({ userId: 7 });

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "groups"."id" as "id",
            "groups"."user_id" as "user_id",
            "groups"."description" as "description",
            "groups"."name" as "name",
            "groups"."progress" as "progress",
            group_statuses.name as "status"
          from "groups"
          inner join "group_statuses"
            on "groups"."status_id" = "group_statuses"."id"
          where
            "groups"."user_id" = $1
            and exists (
              select "tasks"."id"
              from "tasks"
              where
                "tasks"."group_id" = "groups"."id"
                and "tasks"."user_id" = $2
                and (
                  "tasks"."start_date" is not null
                  or "tasks"."deadline" is not null
                )
            )
          order by
            case
              when "groups"."name" = $3 then 0
              else 1
            end,
            "groups"."id" desc
        `,
          parameters: [7, 7, groupsQuerySpec.inboxName],
        });
      },
    );
  });

  test('getByName returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupsReadRepositoryKysely>(
      (db) => new GroupsReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.getByName({ name: 'Work', userId: 77 });

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "g"."id" as "id",
            "g"."user_id" as "user_id",
            "g"."description" as "description",
            "g"."name" as "name",
            "gs"."name" as "status",
            "g"."progress" as "progress"
          from "groups" as "g"
          inner join "group_statuses" as "gs"
            on "g"."status_id" = "gs"."id"
          where
            "g"."name" not in ($1)
            and "g"."name" = $2
            and "g"."user_id" = $3
        `,
          parameters: [groupsQuerySpec.inboxName, 'Work', 77],
        });
      },
    );
  });

  test('getGroup returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupsReadRepositoryKysely>(
      (db) => new GroupsReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const spec = groupsCombinators.and(
          GroupByUserId(5),
          GroupById(42),
          GroupByStatus([GroupStatus.IN_PROGRESS]),
          GroupByNameSearch('Core'),
        );

        await repository.getOne(spec);

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "groups"."id" as "id",
            "groups"."user_id" as "user_id",
            "groups"."description" as "description",
            "groups"."name" as "name",
            "groups"."progress" as "progress",
            group_statuses.name as "status"
          from "groups"
          inner join "group_statuses"
            on "groups"."status_id" = "group_statuses"."id"
          where
            (
              "groups"."user_id" = $1
              and "groups"."id" = $2
              and "group_statuses"."name" in ($3)
              and "groups"."name" ilike $4
            )
        `,
          parameters: [5, 42, GroupStatus.IN_PROGRESS, '%Core%'],
        });
      },
    );
  });

  test('ensureTaskInGroup returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupsReadRepositoryKysely>(
      (db) => new GroupsReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.ensureTaskInGroup({ userId: 15, taskId: 111, groupId: 222 });

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
          from "tasks"
          where
            "tasks"."group_id" = $1
            and "tasks"."id" = $2
            and "tasks"."user_id" = $3
        `,
          parameters: [222, 111, 15],
        });
      },
    );
  });

  test('getGroupInfo returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupsReadRepositoryKysely>(
      (db) => new GroupsReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({ rows: [{ taskCount: '7' }] });

        const result = await repository.getGroupInfo({ groupId: 42, userId: 5 });

        expect(result).toEqual({ taskCount: 7 });
        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select count("tasks"."id") as "taskCount"
          from "tasks"
          inner join "task_statuses"
            on "tasks"."status_id" = "task_statuses"."id"
          where
            "tasks"."group_id" = $1
            and "tasks"."user_id" = $2
            and "task_statuses"."name" not in ($3, $4)
        `,
          parameters: [42, 5, TaskStatus.DELETED, TaskStatus.ARCHIVED],
        });
      },
    );
  });

  test('getSettings returns settings owned by user', async () => {
    await withRepository<TasksDB, GroupsReadRepositoryKysely>(
      (db) => new GroupsReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const settings = { groupId: 42, ...DEFAULT_GROUP_SETTINGS };
        recorder.enqueueResult({ rows: [settings] });

        const result = await repository.getSettings({ groupId: 42, userId: 5 });

        expect(result).toEqual(settings);
        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "group_settings"."group_id" as "groupId",
            "group_settings"."event_color" as "eventColor",
            "group_settings"."event_selected_color" as "eventSelectedColor",
            "group_settings"."line_color" as "lineColor",
            "group_settings"."text_color" as "textColor",
            "group_settings"."event_color_dark" as "eventColorDark",
            "group_settings"."event_selected_color_dark" as "eventSelectedColorDark",
            "group_settings"."line_color_dark" as "lineColorDark",
            "group_settings"."text_color_dark" as "textColorDark",
            "group_settings"."is_default" as "isDefault",
            "group_settings"."is_visible" as "isVisible",
            "group_settings"."is_readonly" as "isReadonly"
          from "group_settings"
          inner join "groups"
            on "groups"."id" = "group_settings"."group_id"
          where
            "group_settings"."group_id" = $1
            and "groups"."user_id" = $2
        `,
          parameters: [42, 5],
        });
      },
    );
  });
});
