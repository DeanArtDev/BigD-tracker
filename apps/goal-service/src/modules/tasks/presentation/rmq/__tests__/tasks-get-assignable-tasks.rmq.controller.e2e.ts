import { initTestEnvironment } from '@/../jest.setup';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalGetAssignableTasks } from '@big-d/api-contracts';
import { specToDebugString } from '@big-d/api-utils';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildPayload,
  connectRmqClients,
  createTestingModule,
  expectTransaction,
  sendMessageBuilder,
} from '@shared/__tests__';
import { getTaskView } from '@shared/__tests__/entities';
import {
  groupReadRepoMock,
  groupWriteRepoMock,
  inboxReadRepoMock,
  tasksReadRepoMock,
  tasksWriteRepoMock,
} from '@shared/__tests__';

initTestEnvironment();
const toTaskResponse = (taskView: ReturnType<typeof getTaskView>) => ({
  id: taskView.id,
  userId: taskView.userId,
  name: taskView.name,
  description: taskView.description,
  priority: taskView.priority,
  cancelReason: taskView.cancelReason,
  endDate: taskView.endDate,
  status: taskView.status,
  recurrence: taskView.recurrence,
});

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

  describe(`${GoalGetAssignableTasks.pattern}`, () => {
    test('should exclude tasks from the provided groups', async () => {
      const userId = 90;
      const groupIds = [120, 121];
      const taskView = getTaskView({ id: 9010, userId, name: 'Assignable' });

      tasksReadRepoMock.getMany.mockResolvedValueOnce([taskView]);

      const payload: GoalGetAssignableTasks.Request = buildPayload({
        data: {
          userId,
          groupIds,
          search: 'Assign',
        },
      });

      const res = await sendMessage<GoalGetAssignableTasks.Response, GoalGetAssignableTasks.Request>(
        GoalGetAssignableTasks.pattern,
        payload,
      );

      expect(tasksReadRepoMock.getMany).toHaveBeenCalledTimes(1);
      const [specArg, params, tasksTrx] = tasksReadRepoMock.getMany.mock.calls[0];
      expect(params).toEqual({ limit: 10000 });
      expect(tasksTrx).toEqual(expectTransaction());
      expect(specToDebugString(specArg)).toMatchInlineSnapshot(`
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
      expect(res).toEqual({ data: [toTaskResponse(taskView)] });
    });

    test('should not filter tasks by group when groupIds are not provided', async () => {
      const userId = 90;
      const taskView = getTaskView({ id: 9010, userId, name: 'Assignable' });

      tasksReadRepoMock.getMany.mockResolvedValueOnce([taskView]);

      const payload: GoalGetAssignableTasks.Request = buildPayload({
        data: {
          userId,
          search: 'Assign',
        },
      });

      const res = await sendMessage<GoalGetAssignableTasks.Response, GoalGetAssignableTasks.Request>(
        GoalGetAssignableTasks.pattern,
        payload,
      );

      expect(tasksReadRepoMock.getMany).toHaveBeenCalledTimes(1);
      const [specArg, params, tasksTrx] = tasksReadRepoMock.getMany.mock.calls[0];
      expect(params).toEqual({ limit: 10000 });
      expect(tasksTrx).toEqual(expectTransaction());
      expect(specToDebugString(specArg)).toMatchInlineSnapshot(`
          "AND(
            tasks.byUserId,
            tasks.byStatus,
            tasks.bySearch
          )"
      `);
      expect(res).toEqual({ data: [toTaskResponse(taskView)] });
    });
  });
});
