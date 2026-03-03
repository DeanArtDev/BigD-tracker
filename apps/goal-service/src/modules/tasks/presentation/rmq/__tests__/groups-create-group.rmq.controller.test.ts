import { initTestEnvironment } from '@/../jest.setup';
import { Group } from '@/modules/tasks/domain/aggregates/group';
import { GroupReadKyselyMapper } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.read-mapper';
import { GroupWriteKyselyMapper } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.write-mapper';
import { GoalsToken, GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalCreateGroup, RmqErrorKind } from '@big-d/api-contracts';
import { specToDebugString } from '@big-d/api-utils';
import { exceptionCode } from '@big-d/exceptions';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildPayload,
  connectRmqClients,
  createTestingModule,
  expectTransaction,
  firstArg,
  mockDate,
  sendMessageBuilder,
  unwrapRpcError,
} from '@shared/__tests__';
import { getGroupRaw } from '@shared/__tests__/entities';
import {
  goalsReadRepoMock,
  groupReadRepoMock,
  groupWriteRepoMock,
  tasksWriteRepoMock,
} from '@shared/__tests__/repository-mocks';

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

  describe(`${GoalCreateGroup.pattern}`, () => {
    test('should work', async () => {
      const groupRaw = getGroupRaw({ user_id: 1, name: 'G1', description: '<b>hi</b>' });
      groupReadRepoMock.getGroup.mockResolvedValueOnce(
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRaw, tasks: [] }),
      );
      groupWriteRepoMock.createGroup.mockResolvedValueOnce(GroupWriteKyselyMapper.fromRawToAgr(groupRaw));
      const payload: GoalCreateGroup.Request = buildPayload({
        data: { userId: groupRaw.user_id, name: groupRaw.name, description: groupRaw.description },
      });

      const res = await sendMessage<GoalCreateGroup.Response, GoalCreateGroup.Request>(
        GoalCreateGroup.pattern,
        payload,
      );

      const [[groupArg, trxArg]] = groupWriteRepoMock.createGroup.mock.calls;
      expect(groupArg).toBeInstanceOf(Group);
      expect(groupArg.id).toEqual(NaN);
      expect(groupArg.name).toEqual(groupRaw.name);
      expect(groupArg.description).toEqual(groupRaw.description);
      expect(groupArg.status).toEqual(groupRaw.status);
      expect(groupArg.userId).toEqual(groupRaw.user_id);
      expect(groupArg.progress).toEqual(groupRaw.progress);
      expect(trxArg).toEqual(expect.anything());

      expect(specToDebugString(firstArg(groupReadRepoMock.getGroup))).toMatchInlineSnapshot(`
          "AND(
            groups.byId,
            groups.byUserId,
            NOT(
              groups.inbox
            )
          )"
      `);
      expect(groupReadRepoMock.getGroup).toHaveBeenCalledWith(expect.anything(), expectTransaction());
      expect(res).toEqual({
        data: {
          id: groupRaw.id,
          name: groupRaw.name,
          description: groupRaw.description,
          status: groupRaw.status,
          userId: groupRaw.user_id,
          progress: groupRaw.progress,
          tasks: [],
        },
      });
    });

    test('should return not found when group view missing', async () => {
      const groupRaw = getGroupRaw({ id: 44, user_id: 2, name: 'Missing view' });
      groupWriteRepoMock.createGroup.mockResolvedValueOnce(GroupWriteKyselyMapper.fromRawToAgr(groupRaw));
      groupReadRepoMock.getGroup.mockResolvedValueOnce(null);
      const payload: GoalCreateGroup.Request = buildPayload({
        data: { userId: groupRaw.user_id, name: groupRaw.name, description: groupRaw.description },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateGroup.Response, GoalCreateGroup.Request>(GoalCreateGroup.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.createGroup).toHaveBeenCalledTimes(1);

      expect(specToDebugString(firstArg(groupReadRepoMock.getGroup))).toMatchInlineSnapshot(`
          "AND(
            groups.byId,
            groups.byUserId,
            NOT(
              groups.inbox
            )
          )"
      `);
      expect(groupReadRepoMock.getGroup).toHaveBeenCalledWith(expect.anything(), expectTransaction());
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.groupNotFound.code,
        key: 'GROUP_NOT_FOUND',
        kind: RmqErrorKind.NOT_FOUND,
        details: { groupId: groupRaw.id },
      });
    });
  });
});
