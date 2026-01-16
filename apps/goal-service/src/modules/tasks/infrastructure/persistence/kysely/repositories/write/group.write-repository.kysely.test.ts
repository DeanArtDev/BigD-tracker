import { TaskStatus } from '@big-d/api-contracts';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { GroupWriteRepositoryKysely } from './group.write-repository.kysely';
import { createSqlCaptureDb, serializeQueries } from '../__tests__/kysely-test-utils';
import { Group, GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';

describe('GroupWriteRepositoryKysely', () => {
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
            status: 'NOT_STARTED',
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
    const repository = new GroupWriteRepositoryKysely(db);

    await repository.getGroupById({ groupId: 5, userId: 7 });

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

  it('builds SQL for createGroup', async () => {
    const { db, queries } = createSqlCaptureDb([
      { rows: [{ id: 1, name: 'NOT_STARTED' }] },
      { rows: [{ id: 5, name: 'Group', user_id: 3, progress: 0, description: 'Desc' }] },
    ]);
    const repository = new GroupWriteRepositoryKysely(db);
    const group = {
      name: 'Group',
      userId: 3,
      description: 'Desc',
    } as unknown as Group;

    await repository.createGroup(group);

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select "id", "name" from "group_statuses" where "name" = $1',
        parameters: ['NOT_STARTED'],
      },
      {
        sql: 'insert into "groups" ("name", "user_id", "description", "status_id") values ($1, $2, $3, $4) returning "id", "name", "user_id", "progress", "description"',
        parameters: ['Group', 3, 'Desc', 1],
      },
    ]);
  });

  it('builds SQL for replaceGroupWithTasks', async () => {
    const { db, queries } = createSqlCaptureDb([
      { rows: [], numAffectedRows: BigInt(1) },
      { rows: [], numAffectedRows: BigInt(2) },
      { rows: [], numAffectedRows: BigInt(1) },
      { rows: [], numAffectedRows: BigInt(1) },
      { rows: [], numAffectedRows: BigInt(2) },
    ]);
    const repository = new GroupWriteRepositoryKysely(db);
    const tasks = [
      TaskView.restore({
        id: 10,
        userId: 3,
        name: 'Task 1',
        description: 'Desc 1',
        priority: 1,
        weight: 2,
        status: TaskStatus.NOT_STARTED,
        startDate: '2024-01-01',
        deadline: '2024-01-02',
        recurrence: 'daily',
      }),
      TaskView.restore({
        id: 11,
        userId: 3,
        name: 'Task 2',
        description: 'Desc 2',
        priority: 2,
        weight: 3,
        status: TaskStatus.NOT_STARTED,
        startDate: '2024-02-01',
        deadline: '2024-02-02',
        recurrence: 'weekly',
      }),
    ];
    const group = {
      id: 5,
      userId: 3,
      name: 'New',
      description: 'Updated',
      tasks,
    } as unknown as GroupWithTasks;

    await repository.replaceGroupWithTasks(group);

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'update "groups" set "name" = $1, "description" = $2 where "id" = $3 and "user_id" = $4 and "name" not in ($5)',
        parameters: ['New', 'Updated', 5, 3, 'IN_BOX'],
      },
      {
        sql: 'delete from "task_to_group" as "ttg" where "ttg"."group_id" = $1',
        parameters: [5],
      },
      {
        sql: 'update "tasks" set "name" = $1, "description" = $2, "priority" = $3, "start_date" = $4, "deadline" = $5, "weight" = $6, "recurrence" = $7 where "id" = $8 and "user_id" = $9',
        parameters: ['Task 1', 'Desc 1', 1, '2024-01-01', '2024-01-02', 2, 'daily', 10, 3],
      },
      {
        sql: 'update "tasks" set "name" = $1, "description" = $2, "priority" = $3, "start_date" = $4, "deadline" = $5, "weight" = $6, "recurrence" = $7 where "id" = $8 and "user_id" = $9',
        parameters: ['Task 2', 'Desc 2', 2, '2024-02-01', '2024-02-02', 3, 'weekly', 11, 3],
      },
      {
        sql: 'insert into "task_to_group" ("task_id", "group_id", "position") values ($1, $2, $3), ($4, $5, $6)',
        parameters: [10, 5, 0, 11, 5, 1],
      },
    ]);
  });

  it('builds SQL for deleteById', async () => {
    const { db, queries } = createSqlCaptureDb([{ rows: [], numAffectedRows: BigInt(1) }]);
    const repository = new GroupWriteRepositoryKysely(db);

    await repository.deleteById({ groupId: 5, userId: 3 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'delete from "groups" as "g" where "g"."id" = $1 and "g"."user_id" = $2 and "g"."name" not in ($3)',
        parameters: [5, 3, 'IN_BOX'],
      },
    ]);
  });
});
