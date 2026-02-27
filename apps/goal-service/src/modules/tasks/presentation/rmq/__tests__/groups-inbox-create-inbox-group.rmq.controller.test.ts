import { GroupsToken } from '@/modules/tasks/tokens';
import { GoalCreateInboxGroup, RmqErrorKind } from '@big-d/api-contracts';
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
import { getGroupInboxView } from '@shared/__tests__/entities';
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
});
