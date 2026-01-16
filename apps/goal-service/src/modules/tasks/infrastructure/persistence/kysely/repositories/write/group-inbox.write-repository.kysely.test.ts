import { GroupInboxWriteRepositoryKysely } from './group-inbox.write-repository.kysely';
import { createSqlCaptureDb, serializeQueries } from '../__tests__/kysely-test-utils';

describe('GroupInboxWriteRepositoryKysely', () => {
  it('builds SQL for createInbox', async () => {
    const { db, queries } = createSqlCaptureDb([
      { rows: [{ id: 2, name: 'IN_PROGRESS' }] },
      { rows: [{ id: 1, name: 'IN_BOX', user_id: 11 }] },
    ]);
    const repository = new GroupInboxWriteRepositoryKysely(db);

    await repository.createInbox({ userId: 11 });

    expect(serializeQueries(queries)).toEqual([
      {
        sql: 'select "id", "name" from "group_statuses" where "name" = $1',
        parameters: ['IN_PROGRESS'],
      },
      {
        sql: 'insert into "groups" ("name", "user_id", "status_id") values ($1, $2, $3) returning "id", "name", "user_id"',
        parameters: ['IN_BOX', 11, 2],
      },
    ]);
  });
});
