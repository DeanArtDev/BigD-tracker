import { GroupStatus } from '@big-d/api-contracts';
import { GroupsReadRepositoryKysely } from './groups.read-repository.kysely';
import { createSqlCaptureDb, serializeQueries } from '../__tests__/kysely-test-utils';

describe('GroupsReadRepositoryKysely', () => {
  it('builds SQL for getByName', async () => {
    const { db, queries } = createSqlCaptureDb([
      {
        rows: [
          {
            id: 5,
            name: 'Work',
            description: null,
            user_id: 2,
            progress: 0,
            status: GroupStatus.NOT_STARTED,
          },
        ],
      },
    ]);
    const repository = new GroupsReadRepositoryKysely(db);

    await repository.getByName({ name: 'Work', userId: 2 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select "g"."id" as "id", "g"."user_id" as "user_id", "g"."description" as "description", "g"."name" as "name", "gs"."name" as "status", "g"."progress" as "progress" from "groups" as "g" inner join "group_statuses" as "gs" on "g"."status_id" = "gs"."id" where "g"."name" not in ($1) and "g"."name" = $2 and "g"."user_id" = $3',
        parameters: ['IN_BOX', 'Work', 2],
      },
    ]);
  });

  it('builds SQL for getGroupById', async () => {
    const { db, queries } = createSqlCaptureDb([
      {
        rows: [
          {
            id: 5,
            name: 'Work',
            description: null,
            user_id: 7,
            progress: 0,
            status: GroupStatus.NOT_STARTED,
          },
        ],
      },
    ]);
    const repository = new GroupsReadRepositoryKysely(db);

    await repository.getGroupById({ groupId: 5, userId: 7 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select "g"."id" as "id", "g"."user_id" as "user_id", "g"."description" as "description", "g"."name" as "name", "gs"."name" as "status", "g"."progress" as "progress" from "groups" as "g" inner join "group_statuses" as "gs" on "g"."status_id" = "gs"."id" where "g"."name" not in ($1) and "g"."id" = $2 and "g"."user_id" = $3',
        parameters: ['IN_BOX', 5, 7],
      },
    ]);
  });

  it('builds SQL for getGroupWithTasksById', async () => {
    const { db, queries } = createSqlCaptureDb([
      {
        rows: [
          {
            id: 5,
            name: 'Work',
            description: null,
            user_id: 7,
            progress: 0,
            status: GroupStatus.NOT_STARTED,
          },
        ],
      },
      {
        rows: [
          {
            id: 1,
            user_id: 7,
            name: 'Task',
            description: null,
            priority: 1,
            weight: 1,
            cancel_reason: null,
            start_date: null,
            end_date: null,
            deadline: null,
            recurrence: null,
            status: 'NOT_STARTED',
          },
        ],
      },
    ]);
    const repository = new GroupsReadRepositoryKysely(db);

    await repository.getGroupWithTasksById({ groupId: 5, userId: 7 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select "g"."id" as "id", "g"."user_id" as "user_id", "g"."description" as "description", "g"."name" as "name", "gs"."name" as "status", "g"."progress" as "progress" from "groups" as "g" inner join "group_statuses" as "gs" on "g"."status_id" = "gs"."id" where "g"."name" not in ($1) and "g"."id" = $2 and "g"."user_id" = $3',
        parameters: ['IN_BOX', 5, 7],
      },
      {
        sql: 'select "t"."id" as "id", "t"."user_id" as "user_id", "t"."name" as "name", "t"."description" as "description", "t"."priority" as "priority", "t"."weight" as "weight", "t"."cancel_reason" as "cancel_reason", "t"."start_date" as "start_date", "t"."end_date" as "end_date", "t"."deadline" as "deadline", "t"."recurrence" as "recurrence", "ts"."name" as "status" from "tasks" as "t" inner join "task_statuses" as "ts" on "t"."status_id" = "ts"."id" inner join "task_to_group" as "ttg" on "t"."id" = "ttg"."task_id" where "ttg"."group_id" = $1 order by "ttg"."position" asc',
        parameters: [5],
      },
    ]);
  });

  it('builds SQL for ensureTaskInGroup', async () => {
    const { db, queries } = createSqlCaptureDb([{ rows: [{ group_id: 5, task_id: 11 }] }]);
    const repository = new GroupsReadRepositoryKysely(db);

    await repository.ensureTaskInGroup({ userId: 7, taskId: 11, groupId: 5 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select from "task_to_group" as "ttg" inner join "groups" as "g" on "g"."id" = "ttg"."group_id" where "ttg"."group_id" = $1 and "ttg"."task_id" = $2 and "g"."user_id" = $3',
        parameters: [5, 11, 7],
      },
    ]);
  });
});
