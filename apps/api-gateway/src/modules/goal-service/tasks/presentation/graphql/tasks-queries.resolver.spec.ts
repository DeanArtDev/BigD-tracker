import { AppRmqClient } from '@/infrastructure/rmq-clients';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GoalGetAssignableTasks, GoalGetTasksCursor, TaskPriority, TaskStatus } from '@big-d/api-contracts';
import { TasksQueriesResolver } from './tasks-queries.resolver';

describe('TasksQueriesResolver', () => {
  test('maps client priorities before requesting tasks', async () => {
    const send = jest.fn().mockResolvedValue({
      data: {
        items: [],
        meta: {
          endCursor: null,
          hasNextPage: false,
        },
      },
    });
    const resolver = new TasksQueriesResolver({ send } as unknown as AppRmqClient);

    await resolver.getTasksCursor({ uid: 42 } as AccessTokenPayload, {
      limit: 12,
      priority: [TaskPriority.Do, TaskPriority.Delete],
    });

    expect(send).toHaveBeenCalledWith(GoalGetTasksCursor.pattern, {
      data: {
        userId: 42,
        search: undefined,
        filter: {
          limit: 12,
          cursor: undefined,
          priority: [1, 4],
          status: undefined,
          groupIds: undefined,
          ids: undefined,
        },
      },
    });
  });

  test('gets assignable tasks and maps them to the GraphQL schema', async () => {
    const send = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'o::1',
          userId: 42,
          name: 'Assignable task',
          priority: 2,
          status: TaskStatus.NOT_STARTED,
        },
      ],
    });
    const resolver = new TasksQueriesResolver({ send } as unknown as AppRmqClient);

    const result = await resolver.getAssignableTasks({ uid: 42 } as AccessTokenPayload, {
      search: 'Assignable',
      groupIds: [7],
    });

    expect(send).toHaveBeenCalledWith(GoalGetAssignableTasks.pattern, {
      data: {
        userId: 42,
        search: 'Assignable',
        groupIds: [7],
      },
    });
    expect(result).toEqual([
      {
        id: 'o::1',
        userId: 42,
        name: 'Assignable task',
        priority: TaskPriority.Plan,
        status: TaskStatus.NOT_STARTED,
      },
    ]);
  });
});
