import { initTestEnvironment } from '@/../jest.setup';
import { Group, GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { GroupReadKyselyMapper } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.read-mapper';
import { GroupWriteKyselyMapper } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.write-mapper';
import { GoalsToken, GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import {
  GoalCreateGroup,
  GoalDeleteGroup,
  GoalGetAssignableGroups,
  GoalGetDetailedGroup,
  GoalGetUserGroups,
  GoalStatus,
  GoalReplaceGroup,
  GroupStatus,
  TaskStatus,
  RmqErrorKind,
} from '@big-d/api-contracts';
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
import {
  getGroupDetailedView,
  getGroupInfoView,
  getGroupRaw,
  getGroupWithTasks,
  getTask,
  getTaskView,
} from '@shared/__tests__/entities';
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

  describe(`${GoalGetUserGroups.pattern}`, () => {
    test('should return user groups', async () => {
      const taskView = getTaskView({ id: 91, userId: 7, name: 'T1', priority: 3, weight: 10 });
      const groupRaw = getGroupRaw({ id: 11, user_id: 7, name: 'Group 1' });
      const groupRawTwo = getGroupRaw({ id: 22, user_id: 7, name: 'Group 2' });
      groupReadRepoMock.getGroupListWithTasks.mockResolvedValueOnce([
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRaw, tasks: [taskView] }),
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRawTwo, tasks: [] }),
      ]);
      const payload: GoalGetUserGroups.Request = buildPayload({
        data: { userId: 7, limit: 1 },
      });

      const res = await sendMessage<GoalGetUserGroups.Response, GoalGetUserGroups.Request>(
        GoalGetUserGroups.pattern,
        payload,
      );

      expect(groupReadRepoMock.getGroupListWithTasks).toHaveBeenCalledTimes(1);
      expect(groupReadRepoMock.getGroupListWithTasks).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { limit: 1 },
        expectTransaction(),
      );
      expect(specToDebugString(firstArg(groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            groups.byUserId,
            NOT(
              groups.inbox
            )
          )"
      `);

      const secondArgs = nthArgs(1, groupReadRepoMock.getGroupListWithTasks);
      expect(specToDebugString(secondArgs)).toMatchInlineSnapshot(`
          "AND(
            tasks.byUserId,
            tasks.byStatus
          )"
      `);

      expect(res).toEqual({
        data: {
          items: [
            {
              id: groupRaw.id,
              name: groupRaw.name,
              description: groupRaw.description,
              status: groupRaw.status,
              userId: groupRaw.user_id,
              progress: groupRaw.progress,
              tasks: [
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
            },
            {
              id: groupRawTwo.id,
              name: groupRawTwo.name,
              description: groupRawTwo.description,
              status: groupRawTwo.status,
              userId: groupRawTwo.user_id,
              progress: groupRawTwo.progress,
              tasks: [],
            },
          ],

          meta: { cursor: 'eyJsYXN0SWQiOjIyfQ==' },
        },
      });
    });

    test('should include search and cursor in specifications and omit next cursor when last part', async () => {
      const userId = 8;
      const cursor = Buffer.from(
        JSON.stringify({ lastId: 10, search: 'Old', sort: ['name'], filter: ['active'] }),
        'utf8',
      ).toString('base64');
      const groupRaw = getGroupRaw({ id: 21, user_id: userId, name: 'Group A' });
      const groupRawTwo = getGroupRaw({ id: 22, user_id: userId, name: 'Group B' });
      groupReadRepoMock.getGroupListWithTasks.mockResolvedValueOnce([
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRaw, tasks: [] }),
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRawTwo, tasks: [] }),
      ]);
      const payload: GoalGetUserGroups.Request = buildPayload({
        data: { userId, limit: 5, search: 'Group', cursor },
      });

      const res = await sendMessage<GoalGetUserGroups.Response, GoalGetUserGroups.Request>(
        GoalGetUserGroups.pattern,
        payload,
      );

      expect(groupReadRepoMock.getGroupListWithTasks).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            groups.byUserId,
            groups.bySearch,
            groups.afterId,
            NOT(
              groups.inbox
            )
          )"
      `);
      expect(specToDebugString(nthArgs(1, groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            tasks.byUserId,
            tasks.byStatus
          )"
      `);
      expect(nthArgs(3, groupReadRepoMock.getGroupListWithTasks)).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          items: [
            {
              id: groupRaw.id,
              name: groupRaw.name,
              description: groupRaw.description,
              status: groupRaw.status,
              userId: groupRaw.user_id,
              progress: groupRaw.progress,
              tasks: [],
            },
            {
              id: groupRawTwo.id,
              name: groupRawTwo.name,
              description: groupRawTwo.description,
              status: groupRawTwo.status,
              userId: groupRawTwo.user_id,
              progress: groupRawTwo.progress,
              tasks: [],
            },
          ],
          meta: { cursor: undefined },
        },
      });
    });

    test('should return next cursor when cursor provided and page is full', async () => {
      const userId = 9;
      const search = 'Group';
      const sort = ['name'];
      const filter = ['active'];
      const cursor = Buffer.from(
        JSON.stringify({ lastId: 30, search, sort, filter }),
        'utf8',
      ).toString('base64');
      const groupRaw = getGroupRaw({ id: 31, user_id: userId, name: 'Group C' });
      const groupRawTwo = getGroupRaw({ id: 32, user_id: userId, name: 'Group D' });
      groupReadRepoMock.getGroupListWithTasks.mockResolvedValueOnce([
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRaw, tasks: [] }),
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRawTwo, tasks: [] }),
      ]);
      const payload: GoalGetUserGroups.Request = buildPayload({
        data: { userId, limit: 2, search, sort, filter, cursor },
      });

      const res = await sendMessage<GoalGetUserGroups.Response, GoalGetUserGroups.Request>(
        GoalGetUserGroups.pattern,
        payload,
      );

      expect(groupReadRepoMock.getGroupListWithTasks).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            groups.byUserId,
            groups.bySearch,
            groups.afterId,
            NOT(
              groups.inbox
            )
          )"
      `);
      expect(specToDebugString(nthArgs(1, groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            tasks.byUserId,
            tasks.byStatus
          )"
      `);
      expect(nthArgs(3, groupReadRepoMock.getGroupListWithTasks)).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          items: [
            {
              id: groupRaw.id,
              name: groupRaw.name,
              description: groupRaw.description,
              status: groupRaw.status,
              userId: groupRaw.user_id,
              progress: groupRaw.progress,
              tasks: [],
            },
            {
              id: groupRawTwo.id,
              name: groupRawTwo.name,
              description: groupRawTwo.description,
              status: groupRawTwo.status,
              userId: groupRawTwo.user_id,
              progress: groupRawTwo.progress,
              tasks: [],
            },
          ],
          meta: {
            cursor:
              'eyJsYXN0SWQiOjMyLCJzb3J0IjpbIm5hbWUiXSwic2VhcmNoIjoiR3JvdXAiLCJmaWx0ZXIiOlsiYWN0aXZlIl19',
          },
        },
      });
    });

    test('should return empty list when no groups found', async () => {
      groupReadRepoMock.getGroupListWithTasks.mockResolvedValueOnce([]);
      const payload: GoalGetUserGroups.Request = buildPayload({
        data: { userId: 77, limit: 10 },
      });

      const res = await sendMessage<GoalGetUserGroups.Response, GoalGetUserGroups.Request>(
        GoalGetUserGroups.pattern,
        payload,
      );

      expect(groupReadRepoMock.getGroupListWithTasks).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            groups.byUserId,
            NOT(
              groups.inbox
            )
          )"
      `);
      expect(specToDebugString(nthArgs(1, groupReadRepoMock.getGroupListWithTasks)))
        .toMatchInlineSnapshot(`
          "AND(
            tasks.byUserId,
            tasks.byStatus
          )"
      `);
      expect(nthArgs(3, groupReadRepoMock.getGroupListWithTasks)).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          items: [],
          meta: { cursor: undefined },
        },
      });
    });
  });

  describe(`${GoalCreateGroup.pattern}`, () => {
    test('should work', async () => {
      const groupRaw = getGroupRaw({ user_id: 1, name: 'G1', description: '<b>hi</b>' });
      groupReadRepoMock.getGroup.mockResolvedValueOnce(
        GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRaw, tasks: [] }),
      );
      groupWriteRepoMock.createGroup.mockResolvedValueOnce(
        GroupWriteKyselyMapper.fromRawToAgr(groupRaw),
      );
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
      expect(groupReadRepoMock.getGroup).toHaveBeenCalledWith(
        expect.anything(),
        expectTransaction(),
      );
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
      groupWriteRepoMock.createGroup.mockResolvedValueOnce(
        GroupWriteKyselyMapper.fromRawToAgr(groupRaw),
      );
      groupReadRepoMock.getGroup.mockResolvedValueOnce(null);
      const payload: GoalCreateGroup.Request = buildPayload({
        data: { userId: groupRaw.user_id, name: groupRaw.name, description: groupRaw.description },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateGroup.Response, GoalCreateGroup.Request>(
          GoalCreateGroup.pattern,
          payload,
        );
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
      expect(groupReadRepoMock.getGroup).toHaveBeenCalledWith(
        expect.anything(),
        expectTransaction(),
      );
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.groupNotFound.code,
        key: 'GROUP_NOT_FOUND',
        kind: RmqErrorKind.NOT_FOUND,
        details: { groupId: groupRaw.id },
      });
    });
  });

  describe(`${GoalReplaceGroup.pattern}`, () => {
    test('should replace group with tasks', async () => {
      const userId = 5;
      const groupId = 12;
      const taskInputOne = {
        id: 101,
        name: 'Task A',
        description: 'desc-a',
        priority: 2,
        weight: 10,
        startDate: '2026-01-01T00:00:00.000Z',
        deadline: '2026-02-01T00:00:00.000Z',
        recurrence: 'daily',
      };
      const taskInputTwo = {
        id: 202,
        name: 'Task B',
        priority: 3,
        weight: 20,
      };
      const groupWithTasks = getGroupWithTasks({ id: groupId, user_id: userId, name: 'Old' });
      const restoredTaskOne = getTask({ id: taskInputOne.id, userId });
      const restoredTaskTwo = getTask({ id: taskInputTwo.id, userId });
      const responseTask = getTaskView({ id: taskInputOne.id, userId, name: taskInputOne.name });

      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(groupWithTasks);
      tasksWriteRepoMock.getTaskById
        .mockResolvedValueOnce(restoredTaskOne)
        .mockResolvedValueOnce(restoredTaskTwo);
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValue(true);
      groupWriteRepoMock.replaceGroupWithTasks.mockResolvedValueOnce(undefined);
      groupReadRepoMock.getGroupWithTasksById.mockResolvedValueOnce(
        GroupReadKyselyMapper.fromRawToWithTaskView({
          ...getGroupRaw({ id: groupId, user_id: userId, name: 'Updated', description: 'New' }),
          tasks: [responseTask],
        }),
      );

      const payload: GoalReplaceGroup.Request = buildPayload({
        data: {
          id: groupId,
          userId,
          name: 'Updated',
          description: 'New',
          tasks: [taskInputOne, taskInputTwo],
        },
      });

      const res = await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(
        GoalReplaceGroup.pattern,
        payload,
      );

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId: taskInputOne.id, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId: taskInputTwo.id, userId },
        expectTransaction(),
      );
      expect(groupReadRepoMock.ensureTaskInGroup).toHaveBeenCalledWith(
        { taskId: taskInputOne.id, groupId, userId },
        expectTransaction(),
      );
      expect(groupReadRepoMock.ensureTaskInGroup).toHaveBeenCalledWith(
        { taskId: taskInputTwo.id, groupId, userId },
        expectTransaction(),
      );
      const [[replacedGroupArg, trxArg]] = groupWriteRepoMock.replaceGroupWithTasks.mock.calls;
      expect(replacedGroupArg).toBeInstanceOf(GroupWithTasks);
      expect(replacedGroupArg.id).toBe(groupId);
      expect(replacedGroupArg.userId).toBe(userId);
      expect(replacedGroupArg.name).toBe('Updated');
      expect(replacedGroupArg.description).toBe('New');
      expect(replacedGroupArg.tasks).toHaveLength(2);
      expect(trxArg).toEqual(expect.anything());
      expect(groupReadRepoMock.getGroupWithTasksById).toHaveBeenCalledWith(
        { groupId, userId },
        { trx: expectTransaction(), throwError: true },
      );
      expect(res).toEqual({
        data: {
          id: groupId,
          name: 'Updated',
          description: 'New',
          status: getGroupRaw().status,
          userId,
          progress: getGroupRaw().progress,
          tasks: [
            {
              id: responseTask.id,
              userId: responseTask.userId,
              name: responseTask.name,
              description: responseTask.description,
              priority: responseTask.priority,
              weight: responseTask.weight,
              cancelReason: responseTask.cancelReason,
              startDate: responseTask.startDate,
              endDate: responseTask.endDate,
              deadline: responseTask.deadline,
              status: responseTask.status,
              recurrence: responseTask.recurrence,
            },
          ],
        },
      });
    });

    test('should replace group without tasks', async () => {
      const userId = 15;
      const groupId = 120;
      const groupWithTasks = getGroupWithTasks({ id: groupId, user_id: userId, tasks: [] });

      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(groupWithTasks);
      groupWriteRepoMock.replaceGroupWithTasks.mockResolvedValueOnce(undefined);
      groupReadRepoMock.getGroupWithTasksById.mockResolvedValueOnce(
        GroupReadKyselyMapper.fromRawToWithTaskView({
          ...getGroupRaw({ id: groupId, user_id: userId, name: 'Updated', description: 'New' }),
          tasks: [],
        }),
      );

      const payload: GoalReplaceGroup.Request = buildPayload({
        data: {
          id: groupId,
          userId,
          name: 'Updated',
          description: 'New',
          tasks: [],
        },
      });

      const res = await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(
        GoalReplaceGroup.pattern,
        payload,
      );

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, groupWriteRepoMock.getGroupById)).toEqual(expectTransaction());
      expect(tasksWriteRepoMock.getTaskById).not.toHaveBeenCalled();
      expect(groupReadRepoMock.ensureTaskInGroup).not.toHaveBeenCalled();
      expect(groupWriteRepoMock.replaceGroupWithTasks).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, groupWriteRepoMock.replaceGroupWithTasks)).toEqual(expectTransaction());
      expect(groupReadRepoMock.getGroupWithTasksById).toHaveBeenCalledTimes(1);
      const optionsArg = nthArgs(1, groupReadRepoMock.getGroupWithTasksById);
      expect(optionsArg?.trx).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          id: groupId,
          name: 'Updated',
          description: 'New',
          status: getGroupRaw().status,
          userId,
          progress: getGroupRaw().progress,
          tasks: [],
        },
      });
    });

    test('should throw when task status not replaceable', async () => {
      const userId = 17;
      const groupId = 122;
      const taskId = 601;

      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: groupId, user_id: userId }),
      );
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, status: TaskStatus.DELETED }),
      );
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValueOnce(true);

      const payload: GoalReplaceGroup.Request = buildPayload({
        data: {
          id: groupId,
          userId,
          name: 'Updated',
          description: 'New',
          tasks: [
            {
              id: taskId,
              name: 'Task',
              priority: 2,
              weight: 10,
            },
          ],
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(
          GoalReplaceGroup.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(groupReadRepoMock.ensureTaskInGroup).toHaveBeenCalledTimes(1);
      expect(groupWriteRepoMock.replaceGroupWithTasks).toHaveBeenCalledTimes(0);
      expect(groupReadRepoMock.getGroupWithTasksById).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status', taskId },
      });
    });

    test('should throw when group status not replaceable', async () => {
      const userId = 16;
      const groupId = 121;
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: groupId, user_id: userId, status: GroupStatus.DONE, tasks: [] }),
      );

      const payload: GoalReplaceGroup.Request = buildPayload({
        data: {
          id: groupId,
          userId,
          name: 'Updated',
          description: 'New',
          tasks: [],
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(
          GoalReplaceGroup.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, groupWriteRepoMock.getGroupById)).toEqual(expectTransaction());
      expect(groupWriteRepoMock.replaceGroupWithTasks).toHaveBeenCalledTimes(0);
      expect(groupReadRepoMock.getGroupWithTasksById).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status' },
      });
    });

    test('should throw when group missing', async () => {
      const payload: GoalReplaceGroup.Request = buildPayload({
        data: {
          id: 999,
          userId: 9,
          name: 'Updated',
          description: 'New',
          tasks: [],
        },
      });
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(null);

      let error: unknown;
      try {
        await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(
          GoalReplaceGroup.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId: 999, userId: 9 },
        expectTransaction(),
      );

      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.groupNotExist.code,
        key: 'GROUP_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { groupId: 999 },
      });
    });

    test('should throw when task is missing', async () => {
      const userId = 10;
      const groupId = 300;
      const payload: GoalReplaceGroup.Request = buildPayload({
        data: {
          id: groupId,
          userId,
          name: 'Updated',
          description: 'New',
          tasks: [
            {
              id: 555,
              name: 'Task',
              priority: 2,
              weight: 10,
            },
          ],
        },
      });
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: groupId, user_id: userId }),
      );
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      let error: unknown;
      try {
        await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(
          GoalReplaceGroup.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId: 555, userId },
        expectTransaction(),
      );
      expect(groupReadRepoMock.ensureTaskInGroup).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId: 555 },
      });
    });

    test('should throw when task not in group', async () => {
      const userId = 10;
      const groupId = 301;
      const payload: GoalReplaceGroup.Request = buildPayload({
        data: {
          id: groupId,
          userId,
          name: 'Updated',
          description: 'New',
          tasks: [
            {
              id: 556,
              name: 'Task',
              priority: 2,
              weight: 10,
            },
          ],
        },
      });
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: groupId, user_id: userId }),
      );
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(getTask({ id: 556, userId }));
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValueOnce(false);

      let error: unknown;
      try {
        await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(
          GoalReplaceGroup.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(groupReadRepoMock.ensureTaskInGroup).toHaveBeenCalledWith(
        { taskId: 556, groupId, userId },
        expectTransaction(),
      );
      expect(groupWriteRepoMock.replaceGroupWithTasks).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotInGroup.code,
        key: 'TASK_NOT_IN_GROUP',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId: 556, groupId },
      });
    });
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

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId },
        expectTransaction(),
      );
      expect(specToDebugString(firstArg(groupWriteRepoMock.delete))).toMatchInlineSnapshot(`
          "AND[groups.policy.delete-by-user](
            groups.byId,
            groups.byUserId,
            NOT(
              groups.inbox
            )
          )"
      `);
      expect(groupWriteRepoMock.delete).toHaveBeenCalledWith(
        expect.anything(),
        expectTransaction(),
      );
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
        await sendMessage<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(
          GoalDeleteGroup.pattern,
          payload,
        );
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
        await sendMessage<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(
          GoalDeleteGroup.pattern,
          payload,
        );
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
      const taskView = getTaskView({ id: 21, userId: 52, name: 'Task in group' });
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: 82, user_id: 52, tasks: [taskView] }),
      );

      let error: unknown;
      try {
        await sendMessage<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(
          GoalDeleteGroup.pattern,
          payload,
        );
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
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: 83, user_id: 53, tasks: [] }),
      );
      groupWriteRepoMock.delete.mockResolvedValueOnce(false);

      let error: unknown;
      try {
        await sendMessage<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(
          GoalDeleteGroup.pattern,
          payload,
        );
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

  describe(`${GoalGetAssignableGroups.pattern}`, () => {
    test('should return only groups not tied to started goals', async () => {
      const groupA = getGroupInfoView({ id: 501, name: 'Group A' });
      const groupB = getGroupInfoView({ id: 502, name: 'Group B' });
      const groupC = getGroupInfoView({ id: 503, name: 'Group C' });

      groupReadRepoMock.getInfoGroups.mockResolvedValueOnce([groupA, groupB, groupC]);
      goalsReadRepoMock.getGoalInfoByChildGroups.mockResolvedValueOnce([
        { groupId: groupB.id, goalId: 9001, goalStatus: GoalStatus.NOT_STARTED },
        { groupId: groupC.id, goalId: 9002, goalStatus: GoalStatus.IN_PROGRESS },
      ]);

      const payload: GoalGetAssignableGroups.Request = buildPayload({
        data: { userId: 300 },
      });

      const res = await sendMessage<
        GoalGetAssignableGroups.Response,
        GoalGetAssignableGroups.Request
      >(GoalGetAssignableGroups.pattern, payload);

      expect(groupReadRepoMock.getInfoGroups).toHaveBeenCalledTimes(1);
      expect(goalsReadRepoMock.getGoalInfoByChildGroups).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(groupReadRepoMock.getInfoGroups))).toMatchInlineSnapshot(`
          "AND(
            groups.byUserId,
            NOT(
              groups.inbox
            ),
            NOT(
              groups.byStatus
            )
          )"
      `);
      expect(nthArgs(1, groupReadRepoMock.getInfoGroups)).toEqual(expectTransaction());
      expect(nthArgs(1, goalsReadRepoMock.getGoalInfoByChildGroups)).toEqual(expectTransaction());
      expect(res).toEqual({ data: [groupA, groupB] });
    });
  });
});
