import { initTestEnvironment } from '@/../jest.setup';
import { GoalsToken, GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalGetGroup, RmqErrorKind } from '@big-d/api-contracts';
import { exceptionCode } from '@big-d/exceptions';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildPayload,
  connectRmqClients,
  createTestingModule,
  goalsReadRepoMock,
  groupReadRepoMock,
  groupWriteRepoMock,
  mockDate,
  sendMessageBuilder,
  tasksWriteRepoMock,
  unwrapRpcError,
} from '@shared/__tests__';

initTestEnvironment();
mockDate();

describe('GroupsRmqController (rmq e2e)', () => {
  let ms: INestMicroservice;
  let client: ClientProxy;
  let sendMessage: ReturnType<typeof sendMessageBuilder>;

  beforeAll(async () => {
    const moduleRef = await createTestingModule()
      .overrideProvider(GroupsToken.WRITE_REPOSITORY)
      .useValue(groupWriteRepoMock)
      .overrideProvider(GroupsToken.READ_REPOSITORY)
      .useValue(groupReadRepoMock)
      .overrideProvider(GoalsToken.READ_REPOSITORY)
      .useValue(goalsReadRepoMock)
      .overrideProvider(TasksToken.WRITE_REPOSITORY)
      .useValue(tasksWriteRepoMock)
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

  describe(`${GoalGetGroup.pattern}`, () => {
    test('should throw when group missing', async () => {
      const userId = 91;
      const groupId = 322;
      groupReadRepoMock.getGroupDetailed.mockResolvedValueOnce(null);

      const payload: GoalGetGroup.Request = buildPayload({
        data: { groupId, userId },
      });

      let error: unknown;
      try {
        await sendMessage<GoalGetGroup.Response, GoalGetGroup.Request>(GoalGetGroup.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(groupReadRepoMock.getGroupDetailed).toHaveBeenCalledTimes(1);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.groupNotFound.code,
        key: 'GROUP_NOT_FOUND',
        kind: RmqErrorKind.NOT_FOUND,
        details: { groupId },
      });
    });
  });
});
