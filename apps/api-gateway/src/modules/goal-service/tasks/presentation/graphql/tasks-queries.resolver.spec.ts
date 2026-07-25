import { AppRmqClient } from '@/infrastructure/rmq-clients';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { GoalGetAssignableTasks, TaskPriority, TaskStatus } from '@big-d/api-contracts';
import { TasksQueriesResolver } from './tasks-queries.resolver';

describe('TasksQueriesResolver', () => {
  test('gets assignable tasks and maps them to the GraphQL schema', async () => {
    const send = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'o::1',
          userId: 42,
          name: 'Assignable task',
          priority: 2,
          weight: 50,
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
        weight: 50,
        status: TaskStatus.NOT_STARTED,
      },
    ]);
  });
});
