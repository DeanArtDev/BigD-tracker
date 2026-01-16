import { TaskStatus } from '@big-d/api-contracts';
import { TasksWriteRepositoryKysely } from './tasks.write-repository.kysely';
import { createSqlCaptureDb, serializeQueries } from '../__tests__/kysely-test-utils';
import { Task } from '@/modules/tasks/domain';

describe('TasksWriteRepositoryKysely', () => {
  const fakeTask = {
    id: 4,
    userId: 2,
    name: 'Task',
    description: 'Desc',
    priority: 1,
    weight: 2,
    cancelReason: null,
    startDate: null,
    endDate: null,
    deadline: null,
    status: TaskStatus.NOT_STARTED,
    recurrence: null,
  } as unknown as Task;

  it('builds SQL for getTaskById', async () => {
    const { db, queries } = createSqlCaptureDb([
      {
        rows: [
          {
            id: 4,
            user_id: 2,
            name: 'Task',
            description: 'Desc',
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
    const repository = new TasksWriteRepositoryKysely(db);

    await repository.getTaskById({ taskId: 4, userId: 2 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select "t"."id" as "id", "t"."user_id" as "user_id", "t"."name" as "name", "t"."description" as "description", "t"."priority" as "priority", "t"."weight" as "weight", "t"."cancel_reason" as "cancel_reason", "t"."start_date" as "start_date", "t"."end_date" as "end_date", "t"."deadline" as "deadline", "t"."recurrence" as "recurrence", "ts"."name" as "status" from "tasks" as "t" inner join "task_statuses" as "ts" on "t"."status_id" = "ts"."id" where "t"."id" = $1 and "t"."user_id" = $2',
        parameters: [4, 2],
      },
    ]);
  });

  it('builds SQL for createTask', async () => {
    const { db, queries } = createSqlCaptureDb([
      { rows: [{ statusId: 1, statusName: 'NOT_STARTED' }] },
      {
        rows: [
          {
            id: 4,
            user_id: 2,
            name: 'Task',
            description: 'Desc',
            priority: 1,
            weight: 2,
            cancel_reason: null,
            start_date: null,
            end_date: null,
            deadline: null,
            recurrence: null,
          },
        ],
      },
    ]);
    const repository = new TasksWriteRepositoryKysely(db);

    await repository.createTask(fakeTask);

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select "id" as "statusId", "name" as "statusName" from "task_statuses" where "task_statuses"."name" = $1',
        parameters: ['NOT_STARTED'],
      },
      {
        sql: 'insert into "tasks" ("cancel_reason", "name", "deadline", "end_date", "start_date", "description", "user_id", "status_id") values ($1, $2, $3, $4, $5, $6, $7, $8) returning "id", "user_id", "name", "description", "priority", "weight", "cancel_reason", "start_date", "end_date", "deadline", "recurrence"',
        parameters: [null, 'Task', null, null, null, 'Desc', 2, 1],
      },
    ]);
  });

  it('builds SQL for replaceTask', async () => {
    const { db, queries } = createSqlCaptureDb([{ rows: [] }]);
    const repository = new TasksWriteRepositoryKysely(db);

    await repository.replaceTask(fakeTask);

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'update "tasks" set "name" = $1, "description" = $2, "priority" = $3, "weight" = $4, "start_date" = $5, "end_date" = $6, "deadline" = $7, "recurrence" = $8 where "id" = $9 and "user_id" = $10 returning "id", "user_id", "name", "description", "priority", "weight", "cancel_reason", "start_date", "end_date", "deadline", "recurrence"',
        parameters: ['Task', 'Desc', 1, 2, null, null, null, null, 4, 2],
      },
    ]);
  });

  it('builds SQL for addTaskToGroup', async () => {
    const { db, queries } = createSqlCaptureDb([
      { rows: [{ count: 3 }] },
      { rows: [], numAffectedRows: BigInt(1) },
    ]);
    const repository = new TasksWriteRepositoryKysely(db);

    await repository.addTaskToGroup({ groupId: 5, taskId: 10 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select count("task_id") as "count" from "task_to_group" where "group_id" = $1',
        parameters: [5],
      },
      {
        sql: 'insert into "task_to_group" ("group_id", "task_id", "position") values ($1, $2, $3)',
        parameters: [5, 10, 3],
      },
    ]);
  });

  it('builds SQL for removeTaskFromGroup', async () => {
    const { db, queries } = createSqlCaptureDb([
      { rows: [{ position: 2, group_id: 5 }] },
      { rows: [], numAffectedRows: BigInt(1) },
    ]);
    const repository = new TasksWriteRepositoryKysely(db);

    await repository.removeTaskFromGroup({ taskId: 10 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'delete from "task_to_group" where "task_id" = $1 returning "position", "group_id"',
        parameters: [10],
      },
      {
        sql: 'update "task_to_group" set "position" = "position" - $1 where "group_id" = $2 and "position" > $3',
        parameters: [1, 5, 2],
      },
    ]);
  });

  it('builds SQL for changeTaskStatus', async () => {
    const { db, queries } = createSqlCaptureDb([
      { rows: [{ statusId: 3 }] },
      { rows: [], numAffectedRows: BigInt(1) },
    ]);
    const repository = new TasksWriteRepositoryKysely(db);

    await repository.changeTaskStatus(fakeTask);

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select "id" as "statusId" from "task_statuses" as "ts" where "ts"."name" = $1',
        parameters: ['NOT_STARTED'],
      },
      {
        sql: 'update "tasks" set "status_id" = $1 where "id" = $2 and "user_id" = $3',
        parameters: [3, 4, 2],
      },
    ]);
  });

  it('builds SQL for deleteTask', async () => {
    const { db, queries } = createSqlCaptureDb([{ rows: [], numAffectedRows: BigInt(1) }]);
    const repository = new TasksWriteRepositoryKysely(db);

    await repository.deleteTask({ userId: 2, taskId: 4 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'delete from "tasks" where "id" = $1 and "user_id" = $2',
        parameters: [4, 2],
      },
    ]);
  });
});
