import { specToDebugString } from '@big-d/api-utils';
import { TaskDatabase, TasksReadRepository } from '../../ports';
import { GetAssignableTasksHandler } from './get-assignable-tasks.handler';
import { GetAssignableTasksQuery } from './get-assignable-tasks.query';

describe('GetAssignableTasksHandler', () => {
  const trx = { id: 333 };
  const getMany = jest.fn().mockResolvedValue([]);
  const runTransaction = jest
    .fn()
    .mockImplementation(async (work: (transaction: typeof trx) => Promise<unknown>) => work(trx));
  const handler = new GetAssignableTasksHandler(
    { runTransaction } as unknown as TaskDatabase,
    { getMany } as unknown as TasksReadRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('excludes tasks from the provided groups and includes tasks without a group', async () => {
    await handler.execute(
      new GetAssignableTasksQuery({
        userId: 90,
        search: 'Assign',
        groupIds: [120, 121],
      }),
    );

    const [specification, params, transaction] = getMany.mock.calls[0];

    expect(params).toEqual({ limit: 10000 });
    expect(transaction).toBe(trx);
    expect(specToDebugString(specification)).toMatchInlineSnapshot(`
      "AND(
        tasks.byUserId,
        tasks.byStatus,
        OR(
          NOT(
            tasks.byGroupId
          ),
          NOT(
            tasks.inGroup
          )
        ),
        tasks.bySearch
      )"
    `);
  });

  test('does not filter tasks by group when groupIds are not provided', async () => {
    await handler.execute(
      new GetAssignableTasksQuery({
        userId: 90,
        search: 'Assign',
      }),
    );

    const [specification] = getMany.mock.calls[0];

    expect(specToDebugString(specification)).toMatchInlineSnapshot(`
      "AND(
        tasks.byUserId,
        tasks.byStatus,
        tasks.bySearch
      )"
    `);
  });
});
