import { TasksDB } from '@/modules/tasks/application/ports';
import { expectSqlQuery, withRepository } from '@shared/__tests__';
import { GroupInboxReadRepositoryKysely } from '../group-inbox.read-repository.kysely';

describe('GroupInboxReadRepositoryKysely', () => {
  test('getInboxWithTasksByUserId returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupInboxReadRepositoryKysely>(
      (db) => new GroupInboxReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.getInboxByUserId({ userId: 77 });

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "g"."id" as "id",
            "g"."user_id" as "user_id",
            "g"."name" as "name"
          from "groups" as "g"
          where
            "g"."name" = $1
            and "g"."user_id" = $2
        `,
          parameters: ['IN_BOX', 77],
        });
      },
    );
  });

  test('ensureTaskInInbox returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupInboxReadRepositoryKysely>(
      (db) => new GroupInboxReadRepositoryKysely(db),
      async ({ repository, recorder }) => {
        await repository.ensureTaskInInbox({ userId: 77, taskId: 333 });

        expect(recorder.queries).toHaveLength(1);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "g"."id" as "id",
            "g"."user_id" as "user_id",
            "g"."name" as "name"
          from "groups" as "g"
          where
            "g"."name" = $1
            and "g"."user_id" = $2
        `,
          parameters: ['IN_BOX', 77],
        });
      },
    );
  });
});
