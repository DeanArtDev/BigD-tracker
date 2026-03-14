import { TasksDB } from '@/modules/tasks/application/ports';
import { GroupById, GroupByUserId, groupsCombinators } from '@/modules/tasks/application/specifications';
import { GroupFactory } from '@/modules/tasks/domain/aggregates/group';
import { getGroupWithTasks, getTask } from '@shared/__tests__/entities';
import { expectSqlQuery, withRepository } from '@shared/__tests__';
import { GroupWriteRepositoryKysely } from '../group.write-repository.kysely';

describe('GroupWriteRepositoryKysely', () => {
  test('getGroupById (without inbox) returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupWriteRepositoryKysely>(
      (db) => new GroupWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.getGroupById({ groupId: 10, userId: 77 });

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
            "groups"."name" not in ($1)
            and "groups"."id" = $2
            and "groups"."user_id" = $3
        `,
          parameters: ['IN_BOX', 10, 77],
        });
      },
    );
  });

  test('getGroupById (with inbox) returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupWriteRepositoryKysely>(
      (db) => new GroupWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.getGroupById({ groupId: 10, userId: 77, includeInbox: true });

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
            "groups"."id" = $1
            and "groups"."user_id" = $2
        `,
          parameters: [10, 77],
        });
      },
    );
  });

  test('createGroup returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupWriteRepositoryKysely>(
      (db) => new GroupWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const group = new GroupFactory().create({ userId: 77, name: 'Group Name', description: 'Desc' });

        recorder.enqueueResult({
          rows: [{ id: 1, name: 'NOT_STARTED' }],
        });
        recorder.enqueueResult({
          rows: [
            {
              id: 101,
              name: 'Group Name',
              user_id: 77,
              progress: 0,
              description: 'Desc',
            },
          ],
        });

        await repository.createGroup(group);

        expect(recorder.queries).toHaveLength(2);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "id",
            "name"
          from "group_statuses"
          where "name" = $1
        `,
          parameters: ['NOT_STARTED'],
        });
        expectSqlQuery(recorder.queries[1], {
          sql: `
          insert into "groups"
            ("name", "user_id", "description", "status_id")
          values
            ($1, $2, $3, $4)
          returning
            "id",
            "name",
            "user_id",
            "progress",
            "description"
        `,
          parameters: ['Group Name', 77, 'Desc', 1],
        });
      },
    );
  });

  test('replaceGroupWithTasks returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupWriteRepositoryKysely>(
      (db) => new GroupWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const group = getGroupWithTasks({
          id: 901,
          user_id: 77,
          tasks: [getTask({ id: 111, userId: 77 })],
        });

        await repository.replaceGroupAndTaskOrder(group);

        expect(recorder.queries).toHaveLength(3);

        expectSqlQuery(recorder.queries[0], {
          sql: `
          update "groups"
          set
            "name" = $1,
            "description" = $2
          where
            "id" = $3
            and "user_id" = $4
            and "name" not in ($5)
        `,
          parameters: ['group name', 'description', 901, 77, 'IN_BOX'],
        });

        expectSqlQuery(recorder.queries[1], {
          sql: `
          delete from "task_to_group" as "ttg"
          where "ttg"."group_id" = $1
        `,
          parameters: [901],
        });

        expectSqlQuery(recorder.queries[2], {
          sql: `
          insert into "task_to_group"
            ("task_id", "group_id", "position")
          values
            ($1, $2, $3)
        `,
          parameters: [111, 901, 0],
        });
      },
    );
  });

  test('delete returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupWriteRepositoryKysely>(
      (db) => new GroupWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        const specification = groupsCombinators.and(GroupByUserId(77), GroupById(901));

        recorder.enqueueResult({
          numAffectedRows: 1n,
        });
        await repository.delete(specification);

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          delete from "groups"
          where
            (
              "groups"."user_id" = $1
              and "groups"."id" = $2
            )
        `,
          parameters: [77, 901],
        });
      },
    );
  });
});
