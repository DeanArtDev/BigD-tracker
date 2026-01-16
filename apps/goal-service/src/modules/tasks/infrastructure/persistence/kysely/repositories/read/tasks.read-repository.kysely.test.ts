import { TaskStatus } from '@big-d/api-contracts';
import { TasksReadRepositoryKysely } from './tasks.read-repository.kysely';
import { createSqlCaptureDb, serializeQueries } from '../__tests__/kysely-test-utils';

describe('TasksReadRepositoryKysely', () => {
  it('builds SQL for getById', async () => {
    const { db, queries } = createSqlCaptureDb([
      {
        rows: [
          {
            id: 3,
            user_id: 9,
            name: 'Task',
            description: 'desc',
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
    const repository = new TasksReadRepositoryKysely(db);

    await repository.getById({ userId: 9, id: 3 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select "t"."id" as "id", "t"."user_id" as "user_id", "t"."name" as "name", "t"."description" as "description", "t"."priority" as "priority", "t"."weight" as "weight", "t"."cancel_reason" as "cancel_reason", "t"."start_date" as "start_date", "t"."end_date" as "end_date", "t"."deadline" as "deadline", "t"."recurrence" as "recurrence", "ts"."name" as "status" from "tasks" as "t" inner join "task_statuses" as "ts" on "t"."status_id" = "ts"."id" where "t"."id" = $1 and "t"."user_id" = $2',
        parameters: [3, 9],
      },
    ]);
  });

  it('builds SQL for isTaskIntoGroup', async () => {
    const { db, queries } = createSqlCaptureDb([{ rows: [{ group_id: 2, task_id: 3 }] }]);
    const repository = new TasksReadRepositoryKysely(db);

    await repository.isTaskIntoGroup({ groupId: 2, taskId: 3 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select from "task_to_group" where "group_id" = $1 and "task_id" = $2',
        parameters: [2, 3],
      },
    ]);
  });

  it('builds SQL for getTaskToGroupLink', async () => {
    const { db, queries } = createSqlCaptureDb([
      { rows: [{ task_id: 3, group_id: 2, position: 1 }] },
    ]);
    const repository = new TasksReadRepositoryKysely(db);

    await repository.getTaskToGroupLink({ taskId: 3 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select * from "task_to_group" where "task_id" = $1',
        parameters: [3],
      },
    ]);
  });
});
