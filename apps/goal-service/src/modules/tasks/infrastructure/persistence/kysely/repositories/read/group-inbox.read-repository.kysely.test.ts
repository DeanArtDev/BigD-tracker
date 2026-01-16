import { TaskStatus } from '@big-d/api-contracts';
import { GroupInboxReadRepositoryKysely } from './group-inbox.read-repository.kysely';
import { createSqlCaptureDb, serializeQueries } from '../__tests__/kysely-test-utils';

describe('GroupInboxReadRepositoryKysely', () => {
  it('builds SQL for getInboxWithTasksByUserId', async () => {
    const { db, queries } = createSqlCaptureDb([
      { rows: [{ id: 1, name: 'Inbox', user_id: 4 }] },
      {
        rows: [
          {
            id: 10,
            user_id: 4,
            name: 'Task',
            description: 'd',
            priority: 1,
            weight: 2,
            cancel_reason: null,
            start_date: null,
            end_date: null,
            deadline: null,
            recurrence: null,
            status: TaskStatus.NOT_STARTED,
          },
        ],
      },
    ]);
    const repository = new GroupInboxReadRepositoryKysely(db);

    await repository.getInboxWithTasksByUserId({ userId: 4 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select "g"."id" as "id", "g"."user_id" as "user_id", "g"."name" as "name" from "groups" as "g" left join "task_to_group" as "ttg" on "ttg"."group_id" = "g"."id" where "g"."name" = $1 and "g"."user_id" = $2',
        parameters: ['IN_BOX', 4],
      },
      {
        sql: 'select "t"."id" as "id", "t"."user_id" as "user_id", "t"."name" as "name", "t"."description" as "description", "t"."priority" as "priority", "t"."weight" as "weight", "t"."cancel_reason" as "cancel_reason", "t"."start_date" as "start_date", "t"."end_date" as "end_date", "t"."deadline" as "deadline", "t"."recurrence" as "recurrence", "ts"."name" as "status" from "tasks" as "t" inner join "task_statuses" as "ts" on "t"."status_id" = "ts"."id" inner join "task_to_group" as "ttg" on "t"."id" = "ttg"."task_id" where "ttg"."group_id" = $1 and "ts"."name" in ($2, $3) order by "t"."id" asc',
        parameters: [1, 'NOT_STARTED', 'IN_PROGRESS'],
      },
    ]);
  });

  it('builds SQL for ensureTaskInInbox', async () => {
    const { db, queries } = createSqlCaptureDb([
      { rows: [{ id: 1, name: 'Inbox', user_id: 4 }] },
      { rows: [{ group_id: 1, task_id: 10 }] },
    ]);
    const repository = new GroupInboxReadRepositoryKysely(db);

    await repository.ensureTaskInInbox({ userId: 4, taskId: 10 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select "g"."id" as "id", "g"."user_id" as "user_id", "g"."name" as "name" from "groups" as "g" left join "task_to_group" as "ttg" on "ttg"."group_id" = "g"."id" where "g"."name" = $1 and "g"."user_id" = $2',
        parameters: ['IN_BOX', 4],
      },
      {
        sql: 'select from "task_to_group" where "group_id" = $1 and "task_id" = $2',
        parameters: [1, 10],
      },
    ]);
  });
});
