import { initTestEnvironment } from '@/../jest.setup';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalGetTasks, TaskStatus } from '@big-d/api-contracts';
import { specToDebugString } from '@big-d/api-utils';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildPayload,
  connectRmqClients,
  createTestingModule,
  expectTransaction,
  firstArg,
  nthArgs,
  sendMessageBuilder,
} from '@shared/__tests__';
import { getTaskView } from '@shared/__tests__/entities';
import {
  groupReadRepoMock,
  groupWriteRepoMock,
  inboxReadRepoMock,
  tasksReadRepoMock,
  tasksWriteRepoMock,
} from '@shared/__tests__/repository-mocks';

initTestEnvironment();

describe('TasksRmqController (rmq e2e)', () => {
  let ms: INestMicroservice;
  let client: ClientProxy;
  let sendMessage: ReturnType<typeof sendMessageBuilder>;

  beforeAll(async () => {
    const moduleRef = await createTestingModule()
      .overrideProvider(TasksToken.WRITE_REPOSITORY)
      .useValue(tasksWriteRepoMock)
      .overrideProvider(TasksToken.READ_REPOSITORY)
      .useValue(tasksReadRepoMock)
      .overrideProvider(GroupsToken.WRITE_REPOSITORY)
      .useValue(groupWriteRepoMock)
      .overrideProvider(GroupsToken.READ_REPOSITORY)
      .useValue(groupReadRepoMock)
      .overrideProvider(GroupsToken.INBOX_READ_REPOSITORY)
      .useValue(inboxReadRepoMock)
      .compile();

    const resp = await connectRmqClients({
      testingModule: moduleRef,
    });

    ms = resp.microservice;
    client = resp.client;
    sendMessage = sendMessageBuilder(client);
  });

  afterAll(async () => {
    await client.close();
    await ms.close();
  });

  describe(`${GoalGetTasks.pattern}`, () => {
    test('should return tasks with nextPage true and full filters', async () => {
      const userId = 88;
      const taskA = getTaskView({
        id: 8801,
        userId,
        name: 'Task A',
        description: 'A',
        priority: 2,
        weight: 2,
        startDate: '2026-03-02T00:00:00.000Z',
        deadline: '2026-03-10T00:00:00.000Z',
        recurrence: 'weekly',
      });
      const taskB = getTaskView({
        id: 8802,
        userId,
        name: 'Task B',
        description: 'B',
        priority: 3,
        weight: 3,
        startDate: '2026-03-03T00:00:00.000Z',
        deadline: '2026-03-11T00:00:00.000Z',
        recurrence: 'daily',
      });
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([taskA, taskB]);

      const payload: GoalGetTasks.Request = buildPayload({
        data: {
          userId,
          search: 'Task',
          filter: {
            group: [700],
            priority: 2,
            status: [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS],
            from: '2026-03-01T00:00:00.000Z',
            to: '2026-03-31T23:59:59.000Z',
          },
          sort: {
            deadline: 'DESC',
            priority: 'ASC',
          },
          page: 1,
          perPage: 2,
        },
      });

      const res = await sendMessage<GoalGetTasks.Response, GoalGetTasks.Request>(
        GoalGetTasks.pattern,
        payload,
      );

      expect(tasksReadRepoMock.getByRange).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(tasksReadRepoMock.getByRange))).toMatchInlineSnapshot(`
        "AND(
          tasks.byUserId,
          tasks.bySearch,
          tasks.byGroupId,
          tasks.byPriority,
          tasks.byStatus,
          tasks.byStartDateLessOrEqual,
          tasks.byDeadlineGreaterOrEqual
        )"
      `);
      expect(nthArgs(3, tasksReadRepoMock.getByRange)).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          items: [
            {
              id: taskA.id,
              userId: taskA.userId,
              name: taskA.name,
              description: taskA.description,
              priority: taskA.priority,
              weight: taskA.weight,
              startDate: taskA.startDate,
              deadline: taskA.deadline,
              status: taskA.status,
              recurrence: taskA.recurrence,
            },
            {
              id: taskB.id,
              userId: taskB.userId,
              name: taskB.name,
              description: taskB.description,
              priority: taskB.priority,
              weight: taskB.weight,
              startDate: taskB.startDate,
              deadline: taskB.deadline,
              status: taskB.status,
              recurrence: taskB.recurrence,
            },
          ],
          meta: { nextPage: true },
        },
      });
    });

    test('should return tasks with nextPage false when items less than perPage', async () => {
      const userId = 89;
      const task = getTaskView({
        id: 8901,
        userId,
        name: 'Single Task',
        description: 'One',
        priority: 4,
        weight: 5,
        startDate: '2026-04-01T00:00:00.000Z',
        deadline: '2026-04-10T00:00:00.000Z',
      });
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([task]);

      const payload: GoalGetTasks.Request = buildPayload({
        data: {
          userId,
          page: 2,
          perPage: 5,
        },
      });

      const res = await sendMessage<GoalGetTasks.Response, GoalGetTasks.Request>(
        GoalGetTasks.pattern,
        payload,
      );

      expect(tasksReadRepoMock.getByRange).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(tasksReadRepoMock.getByRange))).toMatchInlineSnapshot(`
        "AND(
          tasks.byUserId
        )"
      `);
      expect(nthArgs(3, tasksReadRepoMock.getByRange)).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          items: [
            {
              id: task.id,
              userId: task.userId,
              name: task.name,
              description: task.description,
              priority: task.priority,
              weight: task.weight,
              startDate: task.startDate,
              deadline: task.deadline,
              status: task.status,
            },
          ],
          meta: { nextPage: false },
        },
      });
    });
  });
});
