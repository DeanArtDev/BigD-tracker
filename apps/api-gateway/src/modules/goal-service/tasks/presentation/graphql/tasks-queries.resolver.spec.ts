import { AppRmqClient } from '@/infrastructure/rmq-clients';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import {
  GoalGetAssignableTasks,
  GoalGetDiaryTasks,
  GoalGetTaskById,
  GoalGetTasksCursor,
  TaskPriority,
  TaskStatus,
} from '@big-d/api-contracts';
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

  test('gets diary tasks and maps them to the GraphQL schema', async () => {
    const send = jest.fn().mockResolvedValue({
      data: {
        items: [
          {
            id: 'o::2',
            userId: 42,
            name: 'Diary task',
            priority: 1,
            status: TaskStatus.NOT_STARTED,
            recurrence: {
              frequency: 'DAILY',
              interval: 1,
              startDate: '2026-08-01T09:00',
            },
          },
        ],
      },
    });
    const resolver = new TasksQueriesResolver({ send } as unknown as AppRmqClient);

    const result = await resolver.getDiaryTasks({ uid: 42 } as AccessTokenPayload, {
      from: '2026-08-01',
      to: '2026-08-31',
      group: [7, 8],
    });

    expect(send).toHaveBeenCalledWith(GoalGetDiaryTasks.pattern, {
      data: {
        userId: 42,
        filter: {
          from: '2026-08-01',
          to: '2026-08-31',
          group: [7, 8],
        },
      },
    });
    expect(result).toEqual([
      {
        id: 'o::2',
        userId: 42,
        name: 'Diary task',
        priority: TaskPriority.Do,
        status: TaskStatus.NOT_STARTED,
        recurrence: {
          frequency: 'DAILY',
          interval: 1,
          startDate: '2026-08-01T09:00',
        },
      },
    ]);
  });

  test('gets task by id with recurrence and maps it to the GraphQL schema', async () => {
    const recurrence = {
      frequency: 'WEEKLY',
      weekdays: ['MO', 'FR'],
      startDate: '2026-08-03T09:00',
      untilDate: '2026-09-01T09:00',
    };
    const send = jest.fn().mockResolvedValue({
      data: {
        id: 'o::3',
        userId: 42,
        name: 'Recurring task',
        priority: 3,
        status: TaskStatus.IN_PROGRESS,
        recurrence,
      },
    });
    const resolver = new TasksQueriesResolver({ send } as unknown as AppRmqClient);

    const result = await resolver.getTaskById({ uid: 42 } as AccessTokenPayload, { id: 'o::3' });

    expect(send).toHaveBeenCalledWith(GoalGetTaskById.pattern, {
      data: {
        userId: 42,
        taskId: 'o::3',
      },
    });
    expect(result).toEqual({
      id: 'o::3',
      userId: 42,
      name: 'Recurring task',
      priority: TaskPriority.Delegate,
      status: TaskStatus.IN_PROGRESS,
      recurrence,
    });
  });
});
