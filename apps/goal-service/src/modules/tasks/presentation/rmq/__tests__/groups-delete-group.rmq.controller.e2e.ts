import { initTestEnvironment } from '@/../jest.setup';
import { GoalsToken, GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalDeleteGroup, GroupStatus, RmqErrorKind } from '@big-d/api-contracts';
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
  nthArgs,
  sendMessageBuilder,
  unwrapRpcError,
} from '@shared/__tests__';
import { getGroupWithTasks, getTask } from '@shared/__tests__/entities';
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

  describe(`${GoalDeleteGroup.pattern}`, () => {
    test('should delete group', async () => {
      const userId = 50;
      const groupId = 80;
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: groupId, user_id: userId, tasks: [] }),
      );
      groupWriteRepoMock.delete.mockResolvedValueOnce(true);
      const payload: GoalDeleteGroup.Request = buildPayload({
        data: { groupId, userId },
      });

      const res = await sendMessage<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(
        GoalDeleteGroup.pattern,
        payload,
      );

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith({ groupId, userId }, expectTransaction());
      expect(specToDebugString(firstArg(groupWriteRepoMock.delete))).toMatchInlineSnapshot(`
          "AND[groups.policy.delete-by-user](
            groups.byId,
            groups.byUserId,
            NOT(
              groups.inbox
            )
          )"
      `);
      expect(groupWriteRepoMock.delete).toHaveBeenCalledWith(expect.anything(), expectTransaction());
      expect(res).toEqual({ data: true });
    });

    test('should throw when group status done', async () => {
      const payload: GoalDeleteGroup.Request = buildPayload({
        data: { groupId: 84, userId: 54 },
      });
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: 84, user_id: 54, status: GroupStatus.DONE, tasks: [] }),
      );

      let error: unknown;
      try {
        await sendMessage<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(GoalDeleteGroup.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, groupWriteRepoMock.getGroupById)).toEqual(expectTransaction());
      expect(groupWriteRepoMock.delete).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status' },
      });
    });

    test('should throw when group missing', async () => {
      const payload: GoalDeleteGroup.Request = buildPayload({
        data: { groupId: 81, userId: 51 },
      });
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(null);

      let error: unknown;
      try {
        await sendMessage<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(GoalDeleteGroup.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.delete).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.groupNotExist.code,
        key: 'GROUP_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { groupId: 81 },
      });
    });

    test('should throw when group has tasks', async () => {
      const payload: GoalDeleteGroup.Request = buildPayload({
        data: { groupId: 82, userId: 52 },
      });
      const taskView = getTask({ id: 21, userId: 52, name: 'Task in group' });
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: 82, user_id: 52, tasks: [taskView] }),
      );

      let error: unknown;
      try {
        await sendMessage<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(GoalDeleteGroup.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.delete).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: {
          field: 'tasks',
          message: "Group can't be delete if has at least one task",
        },
      });
    });

    test('should throw on write conflict', async () => {
      const payload: GoalDeleteGroup.Request = buildPayload({
        data: { groupId: 83, userId: 53 },
      });
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(getGroupWithTasks({ id: 83, user_id: 53, tasks: [] }));
      groupWriteRepoMock.delete.mockResolvedValueOnce(false);

      let error: unknown;
      try {
        await sendMessage<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(GoalDeleteGroup.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.writeConflict.code,
        key: 'GROUP_WRITE_CONFLICT',
        kind: RmqErrorKind.INTERNAL,
        details: { subjectId: 83, message: 'Group could not be deleted' },
      });
    });
  });
});
