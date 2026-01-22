import { GroupsToken } from '@/modules/tasks/tokens';
import { GoalCreateInboxGroup, GoalGetGroupInBox, RmqErrorKind } from '@big-d/api-contracts';
import { exceptionCode } from '@big-d/exceptions';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildPayload,
  connectRmqClients,
  createTestingModule,
  expectTransaction,
  sendMessageBuilder,
  unwrapRpcError,
} from '@shared/__tests__';
import { getGroupInboxView, getTaskView } from '@shared/__tests__/entities';
import { initTestEnvironment } from '@/../jest.setup';
import { inboxReadRepoMock, inboxWriteRepoMock } from '@shared/__tests__/repository-mocks';

initTestEnvironment();
describe('GroupsInboxRmqController (rmq e2e)', () => {
  let ms: INestMicroservice;
  let client: ClientProxy;
  let sendMessage: ReturnType<typeof sendMessageBuilder>;

  beforeAll(async () => {
    const moduleRef = await createTestingModule()
      .overrideProvider(GroupsToken.INBOX_READ_REPOSITORY)
      .useValue(inboxReadRepoMock)
      .overrideProvider(GroupsToken.INBOX_WRITE_REPOSITORY)
      .useValue(inboxWriteRepoMock)
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

  describe(`${GoalCreateInboxGroup.pattern}`, () => {
    test('should create inbox group', async () => {
      const userId = 201;
      const inboxView = getGroupInboxView({ id: 3001, userId, name: 'Inbox' });

      inboxReadRepoMock.getInboxWithTasksByUserId.mockResolvedValueOnce(null);
      inboxWriteRepoMock.createInbox.mockResolvedValueOnce(inboxView);

      const payload: GoalCreateInboxGroup.Request = buildPayload({
        data: { userId },
      });

      const res = await sendMessage<GoalCreateInboxGroup.Response, GoalCreateInboxGroup.Request>(
        GoalCreateInboxGroup.pattern,
        payload,
      );

      expect(inboxReadRepoMock.getInboxWithTasksByUserId).toHaveBeenCalledWith(
        { userId },
        expectTransaction(),
      );
      expect(inboxWriteRepoMock.createInbox).toHaveBeenCalledWith({ userId }, expectTransaction());
      expect(res).toEqual({ data: inboxView });
    });

    test('should throw when inbox already exists', async () => {
      const userId = 202;
      inboxReadRepoMock.getInboxWithTasksByUserId.mockResolvedValueOnce(
        getGroupInboxView({ id: 3002, userId }),
      );

      const payload: GoalCreateInboxGroup.Request = buildPayload({
        data: { userId },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateInboxGroup.Response, GoalCreateInboxGroup.Request>(
          GoalCreateInboxGroup.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(inboxWriteRepoMock.createInbox).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.inboxAlreadyExist.code,
        key: 'INBOX_ALREADY_EXIST',
        kind: RmqErrorKind.ALREADY_EXISTS,
        details: {},
      });
    });
  });

  describe(`${GoalGetGroupInBox.pattern}`, () => {
    test('should return inbox tasks', async () => {
      const userId = 203;
      const taskView = getTaskView({ id: 4001, userId, name: 'Inbox task' });
      const inboxView = getGroupInboxView({ id: 3003, userId, tasks: [taskView] });

      inboxReadRepoMock.getInboxWithTasksByUserId.mockResolvedValueOnce(inboxView);

      const payload: GoalGetGroupInBox.Request = buildPayload({
        data: { userId },
      });

      const res = await sendMessage<GoalGetGroupInBox.Response, GoalGetGroupInBox.Request>(
        GoalGetGroupInBox.pattern,
        payload,
      );

      expect(inboxReadRepoMock.getInboxWithTasksByUserId).toHaveBeenCalledWith(
        { userId },
        expectTransaction(),
      );
      expect(res).toEqual({
        data: [
          {
            id: taskView.id,
            userId: taskView.userId,
            name: taskView.name,
            description: taskView.description,
            priority: taskView.priority,
            weight: taskView.weight,
            cancelReason: taskView.cancelReason,
            startDate: taskView.startDate,
            endDate: taskView.endDate,
            deadline: taskView.deadline,
            status: taskView.status,
            recurrence: taskView.recurrence,
          },
        ],
      });
    });

    test('should throw when inbox missing', async () => {
      const userId = 204;
      inboxReadRepoMock.getInboxWithTasksByUserId.mockResolvedValueOnce(null);

      const payload: GoalGetGroupInBox.Request = buildPayload({
        data: { userId },
      });

      let error: unknown;
      try {
        await sendMessage<GoalGetGroupInBox.Response, GoalGetGroupInBox.Request>(
          GoalGetGroupInBox.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(inboxReadRepoMock.getInboxWithTasksByUserId).toHaveBeenCalledWith(
        { userId },
        expectTransaction(),
      );
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.inboxNotExist.code,
        key: 'INBOX_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: {},
      });
    });
  });
});
