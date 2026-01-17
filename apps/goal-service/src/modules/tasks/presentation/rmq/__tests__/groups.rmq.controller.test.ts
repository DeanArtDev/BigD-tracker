import {
  GroupsReadRepository,
  GroupsWriteRepository,
  TasksWriteRepository,
} from '@/modules/tasks/application/ports';
import { Group, GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { GroupReadKyselyMapper } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.read-mapper';
import { GroupWriteKyselyMapper } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.write-mapper';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import {
  GoalCreateGroup,
  GoalDeleteGroup,
  GoalGetUserGroups,
  GoalReplaceGroup,
  RmqErrorKind,
} from '@big-d/api-contracts';
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
import { getGroupRaw, getGroupWithTasks, getTask, getTaskView } from '@shared/__tests__/entities';

const groupWriteRepoMock: Record<keyof GroupsWriteRepository, jest.Mock> = {
  createGroup: jest.fn(),
  deleteById: jest.fn(),
  getGroupById: jest.fn(),
  replaceGroupWithTasks: jest.fn(),
};

const groupReadRepoMock: Record<keyof GroupsReadRepository, jest.Mock> = {
  getByName: jest.fn(),
  getGroupById: jest.fn(),
  getGroupWithTasksById: jest.fn(),
  ensureTaskInGroup: jest.fn(),
  getGroupListWithTasksByUserId: jest.fn(),
};

const tasksWriteRepoMock: Record<keyof TasksWriteRepository, jest.Mock> = {
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  changeTaskStatus: jest.fn(),
  replaceTask: jest.fn(),
  addTaskToGroup: jest.fn(),
  removeTaskFromGroup: jest.fn(),
};

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await client.close();
    await ms.close();
  });

  test(`${GoalGetUserGroups.pattern} should return user groups`, async () => {
    const taskView = getTaskView({ id: 91, userId: 7, name: 'T1', priority: 3, weight: 10 });
    const groupRaw = getGroupRaw({ id: 11, user_id: 7, name: 'Group 1' });
    const groupRawTwo = getGroupRaw({ id: 22, user_id: 7, name: 'Group 2' });
    groupReadRepoMock.getGroupListWithTasksByUserId.mockResolvedValueOnce([
      GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRaw, tasks: [taskView] }),
      GroupReadKyselyMapper.fromRawToWithTaskView({ ...groupRawTwo, tasks: [] }),
    ]);
    const payload: GoalGetUserGroups.Request = buildPayload({
      data: { userId: 7 },
    });

    const res = await sendMessage<GoalGetUserGroups.Response, GoalGetUserGroups.Request>(
      GoalGetUserGroups.pattern,
      payload,
    );

    expect(groupReadRepoMock.getGroupListWithTasksByUserId).toHaveBeenCalledTimes(1);
    expect(groupReadRepoMock.getGroupListWithTasksByUserId).toHaveBeenCalledWith(
      { userId: 7 },
      expectTransaction(),
    );
    expect(res).toEqual({
      data: [
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
    });
  });

  test(`${GoalCreateGroup.pattern} should work`, async () => {
    const groupRaw = getGroupRaw({ user_id: 1, name: 'G1', description: '<b>hi</b>' });
    groupReadRepoMock.getGroupById.mockResolvedValueOnce(
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
    expect(groupReadRepoMock.getGroupById).toHaveBeenCalledWith(
      { groupId: groupRaw.id, userId: groupRaw.user_id },
      { trx: expectTransaction() },
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

  test(`${GoalCreateGroup.pattern} should return not found when group view missing`, async () => {
    const groupRaw = getGroupRaw({ id: 44, user_id: 2, name: 'Missing view' });
    groupWriteRepoMock.createGroup.mockResolvedValueOnce(
      GroupWriteKyselyMapper.fromRawToAgr(groupRaw),
    );
    groupReadRepoMock.getGroupById.mockResolvedValueOnce(null);
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
    expect(groupReadRepoMock.getGroupById).toHaveBeenCalledWith(
      { groupId: groupRaw.id, userId: groupRaw.user_id },
      { trx: expectTransaction() },
    );
    expect(unwrapRpcError(error)).toMatchObject({
      code: exceptionCode.groupNotFound.code,
      key: 'GROUP_NOT_FOUND',
      kind: RmqErrorKind.NOT_FOUND,
      details: { groupId: groupRaw.id },
    });
  });

  test(`${GoalReplaceGroup.pattern} should replace group with tasks`, async () => {
    const userId = 5;
    const groupId = 12;
    const taskInputOne = {
      id: 101,
      name: 'Task A',
      description: 'desc-a',
      priority: 2,
      weight: 10,
      startDate: '2024-01-01T00:00:00.000Z',
      deadline: '2024-02-01T00:00:00.000Z',
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

  test(`${GoalReplaceGroup.pattern} should throw when group missing`, async () => {
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

  test(`${GoalReplaceGroup.pattern} should throw when task is missing`, async () => {
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

  test(`${GoalReplaceGroup.pattern} should throw when task not in group`, async () => {
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

  test(`${GoalDeleteGroup.pattern} should delete group`, async () => {
    const userId = 50;
    const groupId = 80;
    groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
      getGroupWithTasks({ id: groupId, user_id: userId, tasks: [] }),
    );
    groupWriteRepoMock.deleteById.mockResolvedValueOnce(true);
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
    expect(groupWriteRepoMock.deleteById).toHaveBeenCalledWith(
      { groupId, userId },
      expectTransaction(),
    );
    expect(res).toEqual({ data: true });
  });

  test(`${GoalDeleteGroup.pattern} should throw when group missing`, async () => {
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

    expect(groupWriteRepoMock.deleteById).not.toHaveBeenCalled();
    expect(unwrapRpcError(error)).toMatchObject({
      code: exceptionCode.groupNotExist.code,
      key: 'GROUP_NOT_EXIST',
      kind: RmqErrorKind.NOT_FOUND,
      details: { groupId: 81 },
    });
  });

  test(`${GoalDeleteGroup.pattern} should throw when group has tasks`, async () => {
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

    expect(groupWriteRepoMock.deleteById).not.toHaveBeenCalled();
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

  test(`${GoalDeleteGroup.pattern} should throw on write conflict`, async () => {
    const payload: GoalDeleteGroup.Request = buildPayload({
      data: { groupId: 83, userId: 53 },
    });
    groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
      getGroupWithTasks({ id: 83, user_id: 53, tasks: [] }),
    );
    groupWriteRepoMock.deleteById.mockResolvedValueOnce(false);

    let error: unknown;
    try {
      await sendMessage<GoalDeleteGroup.Response, GoalDeleteGroup.Request>(
        GoalDeleteGroup.pattern,
        payload,
      );
    } catch (err) {
      error = err;
    }

    expect(groupWriteRepoMock.deleteById).toHaveBeenCalledWith(
      { groupId: 83, userId: 53 },
      expectTransaction(),
    );
    expect(unwrapRpcError(error)).toMatchObject({
      code: exceptionCode.writeConflict.code,
      key: 'GROUP_WRITE_CONFLICT',
      kind: RmqErrorKind.INTERNAL,
      details: { subjectId: 83, message: 'Group could not be deleted' },
    });
  });
});
