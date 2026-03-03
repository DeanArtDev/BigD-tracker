import { initTestEnvironment } from '@/../jest.setup';
import { TaskIdBuilder } from '@/modules/tasks/domain';
import { GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { GroupReadKyselyMapper } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.read-mapper';
import { GoalsToken, GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalReplaceGroup, GroupStatus, TaskStatus, RmqErrorKind } from '@big-d/api-contracts';
import { exceptionCode } from '@big-d/exceptions';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildPayload,
  connectRmqClients,
  createTestingModule,
  expectTransaction,
  mockDate,
  nthArgs,
  sendMessageBuilder,
  unwrapRpcError,
} from '@shared/__tests__';
import { getGroupRaw, getGroupWithTasks, getTask, getTaskView } from '@shared/__tests__/entities';
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
        recurrence: {
          frequency: 3,
          startDate: '2026-01-01T00:00:00.000Z',
          deadline: '2026-02-01T00:00:00.000Z',
        },
      };
      const taskInputTwo = {
        id: 202,
        name: 'Task B',
        priority: 3,
        weight: 20,
        recurrence: {
          frequency: 3,
          startDate: '2026-03-01T00:00:00.000Z',
          deadline: '2026-04-01T00:00:00.000Z',
        },
      };
      const groupWithTasks = getGroupWithTasks({ id: groupId, user_id: userId, name: 'Old' });
      const restoredTaskOne = getTask({ id: taskInputOne.id, userId });
      const restoredTaskTwo = getTask({ id: taskInputTwo.id, userId });
      const responseTask = getTaskView({ id: taskInputOne.id, userId, name: taskInputOne.name });

      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(groupWithTasks);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(restoredTaskOne).mockResolvedValueOnce(restoredTaskTwo);
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
          tasks: [
            { ...taskInputOne, id: TaskIdBuilder.wrapOriginId(taskInputOne.id) },
            { ...taskInputTwo, id: TaskIdBuilder.wrapOriginId(taskInputTwo.id) },
          ],
        },
      });

      const res = await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(
        GoalReplaceGroup.pattern,
        payload,
      );

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith({ groupId, userId }, expectTransaction());
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
              endDate: responseTask.endDate,
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

      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(getGroupWithTasks({ id: groupId, user_id: userId }));
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(getTask({ id: taskId, userId, status: TaskStatus.DELETED }));
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValueOnce(true);

      const payload: GoalReplaceGroup.Request = buildPayload({
        data: {
          id: groupId,
          userId,
          name: 'Updated',
          description: 'New',
          tasks: [
            {
              id: TaskIdBuilder.wrapOriginId(taskId),
              name: 'Task',
              priority: 2,
              weight: 10,
            },
          ],
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(GoalReplaceGroup.pattern, payload);
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
        details: { field: 'weight', taskId },
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
        await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(GoalReplaceGroup.pattern, payload);
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
        await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(GoalReplaceGroup.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith({ groupId: 999, userId: 9 }, expectTransaction());

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
              id: TaskIdBuilder.wrapOriginId(555),
              name: 'Task',
              priority: 2,
              weight: 10,
            },
          ],
        },
      });
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(getGroupWithTasks({ id: groupId, user_id: userId }));
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      let error: unknown;
      try {
        await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(GoalReplaceGroup.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId: 555, userId }, expectTransaction());
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
              id: TaskIdBuilder.wrapOriginId(556),
              name: 'Task',
              priority: 2,
              weight: 10,
            },
          ],
        },
      });
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(getGroupWithTasks({ id: groupId, user_id: userId }));
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(getTask({ id: 556, userId }));
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValueOnce(false);

      let error: unknown;
      try {
        await sendMessage<GoalReplaceGroup.Response, GoalReplaceGroup.Request>(GoalReplaceGroup.pattern, payload);
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
});
