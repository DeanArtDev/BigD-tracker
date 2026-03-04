import { TasksDB } from '@/modules/tasks/application/ports';
import { expectSqlQuery, withRepository } from '@shared/__tests__';
import { GroupInboxWriteRepositoryKysely } from '../group-inbox.write-repository.kysely';

describe('GroupInboxWriteRepositoryKysely', () => {
  test('createInbox returns expected sql and params', async () => {
    await withRepository<TasksDB, GroupInboxWriteRepositoryKysely>(
      (db) => new GroupInboxWriteRepositoryKysely(db),
      async ({ repository, recorder }) => {
        recorder.enqueueResult({
          rows: [{ id: 1, name: 'IN_PROGRESS' }],
        });
        recorder.enqueueResult({
          rows: [{ id: 10, name: 'IN_BOX', user_id: 77 }],
        });

        await repository.createInbox({ userId: 77 });

        expect(recorder.queries).toHaveLength(2);
        expectSqlQuery(recorder.queries[0], {
          sql: `
          select
            "id",
            "name"
          from "group_statuses"
          where "name" = $1
        `,
          parameters: ['IN_PROGRESS'],
        });
        expectSqlQuery(recorder.queries[1], {
          sql: `
          insert into "groups"
            ("name", "user_id", "status_id")
          values
            ($1, $2, $3)
          returning
            "id",
            "name",
            "user_id"
        `,
          parameters: ['IN_BOX', 77, 1],
        });
      },
    );
  });
});
