import { INBOX_GROUP_KEY } from '@/modules/tasks/application/ports';
import {
  firstOrThrowError,
  getAvailableGroupQuery,
  getGroupWithStatusQuery,
  getInboxByUserIdQuery,
  getTasksWithStatusQuery,
} from './index';
import { createSqlCaptureDb } from '../__tests__/kysely-test-utils';

describe('kysely repository helpers', () => {
  it('builds getTasksWithStatusQuery SQL', () => {
    const { db } = createSqlCaptureDb();

    const compiled = getTasksWithStatusQuery(db).compile();

    expect(compiled.sql).toBe(
      'select "t"."id" as "id", "t"."user_id" as "user_id", "t"."name" as "name", "t"."description" as "description", "t"."priority" as "priority", "t"."weight" as "weight", "t"."cancel_reason" as "cancel_reason", "t"."start_date" as "start_date", "t"."end_date" as "end_date", "t"."deadline" as "deadline", "t"."recurrence" as "recurrence", "ts"."name" as "status" from "tasks" as "t" inner join "task_statuses" as "ts" on "t"."status_id" = "ts"."id"',
    );
    expect(compiled.parameters).toEqual([]);
  });

  it('builds getGroupWithStatusQuery SQL', () => {
    const { db } = createSqlCaptureDb();

    const compiled = getGroupWithStatusQuery(db).compile();

    expect(compiled.sql).toBe(
      'select "g"."id" as "id", "g"."user_id" as "user_id", "g"."description" as "description", "g"."name" as "name", "gs"."name" as "status", "g"."progress" as "progress" from "groups" as "g" inner join "group_statuses" as "gs" on "g"."status_id" = "gs"."id"',
    );
    expect(compiled.parameters).toEqual([]);
  });

  it('builds getAvailableGroupQuery SQL', () => {
    const { db } = createSqlCaptureDb();

    const compiled = getAvailableGroupQuery(db).compile();

    expect(compiled.sql).toBe(
      'select "g"."id" as "id", "g"."user_id" as "user_id", "g"."description" as "description", "g"."name" as "name", "gs"."name" as "status", "g"."progress" as "progress" from "groups" as "g" inner join "group_statuses" as "gs" on "g"."status_id" = "gs"."id" where "g"."name" not in ($1)',
    );
    expect(compiled.parameters).toEqual([INBOX_GROUP_KEY]);
  });

  it('builds getInboxByUserIdQuery SQL', () => {
    const { db } = createSqlCaptureDb();

    const compiled = getInboxByUserIdQuery(db, { userId: 4 }).compile();

    expect(compiled.sql).toBe(
      'select "g"."id" as "id", "g"."user_id" as "user_id", "g"."name" as "name" from "groups" as "g" left join "task_to_group" as "ttg" on "ttg"."group_id" = "g"."id" where "g"."name" = $1 and "g"."user_id" = $2',
    );
    expect(compiled.parameters).toEqual([INBOX_GROUP_KEY, 4]);
  });

  it('chooses the correct first-or-throw branch', async () => {
    const executeTakeFirst = jest.fn(async () => undefined);
    const executeTakeFirstOrThrow = jest.fn(async () => ({ id: 1 }));

    await expect(firstOrThrowError({ executeTakeFirst, executeTakeFirstOrThrow }, {})).resolves.toBeNull();
    await expect(
      firstOrThrowError({ executeTakeFirst, executeTakeFirstOrThrow }, { throwError: true }),
    ).resolves.toEqual({ id: 1 });

    expect(executeTakeFirst).toHaveBeenCalledTimes(1);
    expect(executeTakeFirstOrThrow).toHaveBeenCalledTimes(1);
  });
});
