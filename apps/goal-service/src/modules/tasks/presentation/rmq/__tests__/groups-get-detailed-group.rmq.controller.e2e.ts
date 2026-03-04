import { initTestEnvironment } from '@/../jest.setup';
import { GoalsToken, GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalGetDetailedGroup, RmqErrorKind } from '@big-d/api-contracts';
import { specToDebugString } from '@big-d/api-utils';
import { exceptionCode } from '@big-d/exceptions';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildPayload,
  connectRmqClients,
  createTestingModule,
  expectTransaction,
  mockDate,
  sendMessageBuilder,
  unwrapRpcError,
} from '@shared/__tests__';
import { getGroupDetailedView, getTaskView } from '@shared/__tests__/entities';
import { goalsReadRepoMock, groupReadRepoMock, groupWriteRepoMock, tasksWriteRepoMock } from '@shared/__tests__';

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

  describe(`${GoalGetDetailedGroup.pattern}`, () => {
    test('should return group details', async () => {
      const userId = 90;
      const groupId = 321;
      const taskView = getTaskView({ id: 701, userId, name: 'Detailed task' });
      const detailedGroup = getGroupDetailedView({
        id: groupId,
        user_id: userId,
        name: 'Detailed',
        tasks: [taskView],
      });
      groupReadRepoMock.getGroupDetailed.mockResolvedValueOnce(detailedGroup);

      const payload: GoalGetDetailedGroup.Request = buildPayload({
        data: { groupId, userId },
      });

      const res = await sendMessage<GoalGetDetailedGroup.Response, GoalGetDetailedGroup.Request>(
        GoalGetDetailedGroup.pattern,
        payload,
      );

      expect(groupReadRepoMock.getGroupDetailed).toHaveBeenCalledTimes(1);
      const [groupSpecArg, taskSpecArgs, trxArg] = groupReadRepoMock.getGroupDetailed.mock.calls[0];
      expect(trxArg).toEqual(expectTransaction());
      expect(specToDebugString(groupSpecArg)).toMatchInlineSnapshot(`
          "AND(
            groups.byId,
            groups.byUserId,
            NOT(
              groups.inbox
            )
          )"
      `);
      expect(specToDebugString(taskSpecArgs)).toMatchInlineSnapshot(`
          "AND(
            tasks.byStatus
          )"
      `);
      expect(res).toEqual({ data: detailedGroup.toJSON() });
    });

    test('should throw when group missing', async () => {
      const userId = 91;
      const groupId = 322;
      groupReadRepoMock.getGroupDetailed.mockResolvedValueOnce(null);

      const payload: GoalGetDetailedGroup.Request = buildPayload({
        data: { groupId, userId },
      });

      let error: unknown;
      try {
        await sendMessage<GoalGetDetailedGroup.Response, GoalGetDetailedGroup.Request>(
          GoalGetDetailedGroup.pattern,
          payload,
        );
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
