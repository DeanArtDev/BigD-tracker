import { initTestEnvironment } from '@/../jest.setup';
import { TaskIdBuilder } from '@/modules/tasks/domain';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalAssignTaskToGroup, RmqErrorKind, TaskStatus } from '@big-d/api-contracts';
import { exceptionCode } from '@big-d/exceptions';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildPayload,
  connectRmqClients,
  createTestingModule,
  expectTransaction,
  nthArgs,
  sendMessageBuilder,
  unwrapRpcError,
} from '@shared/__tests__';
import { getGroupWithTasks, getTask } from '@shared/__tests__/entities';
import {
  groupReadRepoMock,
  groupWriteRepoMock,
  inboxReadRepoMock,
  tasksReadRepoMock,
  tasksWriteRepoMock,
} from '@shared/__tests__';

initTestEnvironment();

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

  describe(`${GoalAssignTaskToGroup.pattern}`, () => {
    test('should assign task to group', async () => {
      const userId = 60;
      const taskId = 7001;
      const groupId = 900;
      const existingTask = getTask({ id: taskId, userId, name: 'Assign' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValueOnce(false);
      tasksWriteRepoMock.removeTaskFromGroup.mockResolvedValueOnce(undefined);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(getGroupWithTasks({ id: groupId, user_id: userId }));
      tasksWriteRepoMock.addTaskToGroup.mockResolvedValueOnce(undefined);

      const payload: GoalAssignTaskToGroup.Request = buildPayload({
        data: {
          taskId: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          groupId,
        },
      });

      const res = await sendMessage<GoalAssignTaskToGroup.Response, GoalAssignTaskToGroup.Request>(
        GoalAssignTaskToGroup.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(groupReadRepoMock.ensureTaskInGroup).toHaveBeenCalledWith(
        { taskId, userId, groupId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.removeTaskFromGroup).toHaveBeenCalledWith({ taskId }, expectTransaction());
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId, includeInbox: true },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledWith({ taskId, groupId }, expectTransaction());
      expect(res).toEqual({ data: { success: true } });
    });

    test('should throw when task status not assignable', async () => {
      const userId = 64;
      const taskId = 7005;
      const groupId = 904;
      const existingTask = getTask({ id: taskId, userId, status: TaskStatus.COMPLETED });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValueOnce(false);

      const payload: GoalAssignTaskToGroup.Request = buildPayload({
        data: {
          taskId: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          groupId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalAssignTaskToGroup.Response, GoalAssignTaskToGroup.Request>(
          GoalAssignTaskToGroup.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(nthArgs(1, groupReadRepoMock.ensureTaskInGroup)).toEqual(expectTransaction());
      expect(groupReadRepoMock.ensureTaskInGroup).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.removeTaskFromGroup).toHaveBeenCalledTimes(0);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status', taskId },
      });
    });

    test('should throw when task missing', async () => {
      const userId = 61;
      const taskId = 7002;
      const groupId = 901;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalAssignTaskToGroup.Request = buildPayload({
        data: {
          taskId: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          groupId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalAssignTaskToGroup.Response, GoalAssignTaskToGroup.Request>(
          GoalAssignTaskToGroup.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(groupReadRepoMock.ensureTaskInGroup).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });

    test('should throw when task already in group', async () => {
      const userId = 62;
      const taskId = 7003;
      const groupId = 902;
      const existingTask = getTask({ id: taskId, userId, name: 'Assign' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValueOnce(true);

      const payload: GoalAssignTaskToGroup.Request = buildPayload({
        data: {
          taskId: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          groupId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalAssignTaskToGroup.Response, GoalAssignTaskToGroup.Request>(
          GoalAssignTaskToGroup.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(groupReadRepoMock.ensureTaskInGroup).toHaveBeenCalledWith(
        { taskId, userId, groupId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.removeTaskFromGroup).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskAlreadyInGroup.code,
        key: 'TASK_ALREADY_IN_GROUP',
        kind: RmqErrorKind.ALREADY_EXISTS,
        details: { taskId, groupId },
      });
    });

    test('should throw when group missing', async () => {
      const userId = 63;
      const taskId = 7004;
      const groupId = 903;
      const existingTask = getTask({ id: taskId, userId, name: 'Assign' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValueOnce(false);
      tasksWriteRepoMock.removeTaskFromGroup.mockResolvedValueOnce(undefined);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(null);

      const payload: GoalAssignTaskToGroup.Request = buildPayload({
        data: {
          taskId: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          groupId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalAssignTaskToGroup.Response, GoalAssignTaskToGroup.Request>(
          GoalAssignTaskToGroup.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.removeTaskFromGroup).toHaveBeenCalledWith({ taskId }, expectTransaction());
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId, includeInbox: true },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.addTaskToGroup).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.groupNotExist.code,
        key: 'GROUP_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { groupId },
      });
    });
  });
});
