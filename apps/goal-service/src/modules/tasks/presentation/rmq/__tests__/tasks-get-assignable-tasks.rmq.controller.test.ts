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
} from '@shared/__tests__/repository-mocks';

initTestEnvironment();
const toTaskResponse = (taskView: ReturnType<typeof getTaskView>) => ({
  id: taskView.id,
  userId: taskView.userId,
  name: taskView.name,
  description: taskView.description,
  priority: taskView.priority,
  weight: taskView.weight,
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
    test('should return assignable tasks', async () => {
      const userId = 90;
      const groupId = 120;
      const taskView = getTaskView({ id: 9010, userId, name: 'Assignable' });

      tasksReadRepoMock.getMany.mockResolvedValueOnce([taskView]);

      const payload: GoalGetAssignableTasks.Request = buildPayload({
        data: {
          userId,
          groupId,
          search: 'Assign',
        },
      });

      const res = await sendMessage<GoalGetAssignableTasks.Response, GoalGetAssignableTasks.Request>(
        GoalGetAssignableTasks.pattern,
        payload,
      );

      expect(tasksReadRepoMock.getMany).toHaveBeenCalledTimes(1);
      const [, specArg, tasksTrx] = tasksReadRepoMock.getMany.mock.calls[0];
      expect(tasksTrx).toEqual(expectTransaction());
      expect(specToDebugString(specArg)).toMatchInlineSnapshot(`
          "AND(
            tasks.byUserId,
            tasks.byStatus,
            NOT(
              tasks.inGroup
            ),
            tasks.bySearch
          )"
      `);
      expect(res).toEqual({ data: [toTaskResponse(taskView)] });
    });
  });
});
