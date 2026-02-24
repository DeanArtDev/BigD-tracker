import { initTestEnvironment } from '@/../jest.setup';
import { Task } from '@/modules/tasks/domain';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import {
  GoalAssignTaskToGroup,
  GoalCloneTask,
  GoalCreateTask,
  GoalDeleteTask,
  GoalFinishTask,
  GoalGetTasks,
  GoalGetAssignableTasks,
  GoalReplaceTask,
  GoalUnassignTaskFromGroup,
  GoalUpdateInboxTask,
  RmqErrorKind,
  TaskStatus,
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
  nthArgs,
  sendMessageBuilder,
  unwrapRpcError,
} from '@shared/__tests__';
import { getGroupWithTasks, getTask, getTaskView } from '@shared/__tests__/entities';
import {
  groupReadRepoMock,
  groupWriteRepoMock,
  inboxReadRepoMock,
  tasksReadRepoMock,
  tasksWriteRepoMock,
} from '@shared/__tests__/repository-mocks';

initTestEnvironment();
const toTaskResponse = (taskView: ReturnType<typeof getTaskView>) => ({
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
});

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

  describe(`${GoalCreateTask.pattern}`, () => {
    test('should create task without group', async () => {
      const userId = 10;
      const createdTask = getTask({ id: 44, userId, name: 'Task A', priority: 4, weight: 2 });
      const taskView = getTaskView({ id: createdTask.id, userId, name: createdTask.name });

      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(createdTask);
      tasksReadRepoMock.getById.mockResolvedValueOnce(taskView);

      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Task A',
          priority: 4,
          weight: 2,
        },
      });

      const res = await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
        GoalCreateTask.pattern,
        payload,
      );

      const [[createdTaskArg, trxArg]] = tasksWriteRepoMock.createTask.mock.calls;
      expect(createdTaskArg).toBeInstanceOf(Task);
      expect(createdTaskArg.id).toEqual(NaN);
      expect(createdTaskArg.userId).toBe(userId);
      expect(createdTaskArg.name).toBe('Task A');
      expect(createdTaskArg.priority).toBe(4);
      expect(createdTaskArg.weight).toBe(2);
      expect(trxArg).toEqual(expectTransaction());
      expect(groupWriteRepoMock.getGroupById).not.toHaveBeenCalled();
      expect(tasksWriteRepoMock.addTaskToGroup).not.toHaveBeenCalled();
      expect(tasksReadRepoMock.getById).toHaveBeenCalledWith(
        { id: createdTask.id, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId: createdTask.id, userId },
        expectTransaction(),
      );
      expect(res).toEqual({ data: toTaskResponse(taskView) });
    });

    test('should create task with group', async () => {
      const userId = 11;
      const groupId = 201;
      const createdTask = getTask({ id: 55, userId, name: 'Task B' });
      const taskView = getTaskView({ id: createdTask.id, userId, name: createdTask.name });

      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(createdTask);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: groupId, user_id: userId }),
      );
      tasksWriteRepoMock.addTaskToGroup.mockResolvedValueOnce(undefined);
      tasksReadRepoMock.getById.mockResolvedValueOnce(taskView);

      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          groupId,
          name: 'Task B',
        },
      });

      const res = await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
        GoalCreateTask.pattern,
        payload,
      );

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledWith(
        { taskId: createdTask.id, groupId },
        expectTransaction(),
      );
      expect(tasksReadRepoMock.getById).toHaveBeenCalledWith(
        { id: createdTask.id, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId: createdTask.id, userId },
        expectTransaction(),
      );
      expect(res).toEqual({ data: toTaskResponse(taskView) });
    });

    test('should throw when startDate in past', async () => {
      const userId = 14;
      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Past task',
          startDate: '2000-01-01T00:00:00.000Z',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(0);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'startDate' },
      });
    });

    test('should throw when deadline in past', async () => {
      const userId = 15;
      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Past deadline task',
          deadline: '2000-01-01T00:00:00.000Z',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(0);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'deadline' },
      });
    });

    test('should throw when startDate after deadline', async () => {
      const userId = 16;
      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Invalid date range',
          startDate: '2099-02-01T00:00:00.000Z',
          deadline: '2099-01-01T00:00:00.000Z',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(0);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'startDate' },
      });
    });

    test('should throw when group missing', async () => {
      const userId = 12;
      const groupId = 300;
      const createdTask = getTask({ id: 60, userId, name: 'Task C' });
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(createdTask);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(null);

      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          groupId,
          name: 'Task C',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.addTaskToGroup).not.toHaveBeenCalled();
      expect(tasksReadRepoMock.getById).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.groupNotExist.code,
        key: 'GROUP_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { groupId },
      });
    });

    test('should throw when task view missing', async () => {
      const userId = 13;
      const createdTask = getTask({ id: 70, userId, name: 'Task D' });
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(createdTask);
      tasksReadRepoMock.getById.mockResolvedValueOnce(null);

      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Task D',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksReadRepoMock.getById).toHaveBeenCalledWith(
        { id: createdTask.id, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotFound.code,
        key: 'TASK_NOT_FOUNT',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId: createdTask.id },
      });
    });

    test('should throw when task creation read-after-write failed', async () => {
      const userId = 17;
      const createdTask = getTask({ id: 71, userId, name: 'Task E' });
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Task E',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskCreationFailed.code,
        key: 'TASK_CREATION_FAILED',
        kind: RmqErrorKind.INTERNAL,
        details: { taskId: createdTask.id },
      });
    });
  });

  describe(`${GoalCloneTask.pattern}`, () => {
    test('should clone task without group', async () => {
      const userId = 21;
      const taskId = 2001;
      const originalTask = getTask({ id: taskId, userId, name: 'Original' });
      const clonedTask = getTask({ id: originalTask.id + 1, userId, name: originalTask.name });
      const taskView = getTaskView({ id: clonedTask.id, userId, name: clonedTask.name });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(originalTask);
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(clonedTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(clonedTask);
      tasksReadRepoMock.getById.mockResolvedValueOnce(taskView);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId,
        },
      });

      const res = await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(
        GoalCloneTask.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      const [[clonedTaskArg, trxArg]] = tasksWriteRepoMock.createTask.mock.calls;
      expect(clonedTaskArg).toBeInstanceOf(Task);
      expect(clonedTaskArg.id).toEqual(NaN);
      expect(clonedTaskArg.name).toBe('Original');
      expect(trxArg).toEqual(expectTransaction());
      expect(tasksReadRepoMock.getById).toHaveBeenCalledWith(
        { id: clonedTask.id, userId },
        expectTransaction(),
      );
      expect(res).toEqual({ data: toTaskResponse(clonedTask) });
    });

    test('should clone task with group', async () => {
      const userId = 22;
      const taskId = 3001;
      const groupId = 401;

      const originalTask = getTask({ id: taskId, userId, name: 'Original' });
      const clonedTask = getTask({ ...originalTask, id: originalTask.id + 1 });
      const taskView = getTaskView({ id: clonedTask.id, userId, name: clonedTask.name });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(originalTask);
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(clonedTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(clonedTask);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: groupId, user_id: userId }),
      );
      tasksWriteRepoMock.addTaskToGroup.mockResolvedValueOnce(undefined);
      tasksReadRepoMock.getById.mockResolvedValueOnce(taskView);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId,
          groupId,
        },
      });

      const res = await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(
        GoalCloneTask.pattern,
        payload,
      );

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledWith(
        { taskId: clonedTask.id, groupId },
        expectTransaction(),
      );
      expect(res).toEqual({ data: toTaskResponse(taskView) });
    });

    test('should throw when task missing', async () => {
      const userId = 23;
      const taskId = 3003;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(
          GoalCloneTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.createTask).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });

    test('should throw when group missing', async () => {
      const userId = 24;
      const taskId = 3004;
      const groupId = 402;
      const originalTask = getTask({ id: taskId, userId, name: 'Original' });
      const clonedTask = getTask({ id: 3005, userId, name: 'Original' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(originalTask);
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(clonedTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(clonedTask);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(null);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId,
          groupId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(
          GoalCloneTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.addTaskToGroup).not.toHaveBeenCalled();
      expect(tasksReadRepoMock.getById).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.groupNotExist.code,
        key: 'GROUP_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { groupId },
      });
    });

    test('should throw when task view missing', async () => {
      const userId = 25;
      const taskId = 3006;
      const originalTask = getTask({ id: taskId, userId, name: 'Original' });
      const clonedTask = getTask({ id: 3007, userId, name: 'Original' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(originalTask);
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(clonedTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(clonedTask);
      tasksReadRepoMock.getById.mockResolvedValueOnce(null);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(
          GoalCloneTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksReadRepoMock.getById).toHaveBeenCalledWith(
        { id: clonedTask.id, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(2);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotFound.code,
        key: 'TASK_NOT_FOUNT',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId: clonedTask.id },
      });
    });

    test('should throw when cloned task missing after write', async () => {
      const userId = 26;
      const taskId = 3008;
      const originalTask = getTask({ id: taskId, userId, name: 'Original' });
      const createdTask = getTask({ id: 3009, userId, name: 'Original' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(originalTask);
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(
          GoalCloneTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(2);
      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskCreationFailed.code,
        key: 'TASK_CREATION_FAILED',
        kind: RmqErrorKind.INTERNAL,
        details: { taskId: createdTask.id },
      });
    });
  });

  describe(`${GoalReplaceTask.pattern}`, () => {
    test('should replace task', async () => {
      const userId = 31;
      const taskId = 4011;
      const existingTask = getTask({ id: taskId, userId, name: 'Old' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      tasksWriteRepoMock.replaceTask.mockImplementation((task: Task) => task);

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Updated',
          description: 'Updated desc',
          priority: 2,
          weight: 5,
          startDate: '2099-01-01T00:00:00.000Z',
          deadline: '2099-02-01T00:00:00.000Z',
          recurrence: 'weekly',
        },
      });

      const res = await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(
        GoalReplaceTask.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      const [[replacedTaskArg, trxArg]] = tasksWriteRepoMock.replaceTask.mock.calls;
      expect(replacedTaskArg).toBeInstanceOf(Task);
      expect(replacedTaskArg.id).toBe(taskId);
      expect(replacedTaskArg.name).toBe('Updated');
      expect(replacedTaskArg.description).toBe('Updated desc');
      expect(replacedTaskArg.priority).toBe(2);
      expect(replacedTaskArg.weight).toBe(5);
      expect(replacedTaskArg.startDate).toBe('2099-01-01T00:00:00.000Z');
      expect(replacedTaskArg.deadline).toBe('2099-02-01T00:00:00.000Z');
      expect(replacedTaskArg.recurrence).toBe('weekly');
      expect(trxArg).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          id: taskId,
          userId,
          name: 'Updated',
          description: 'Updated desc',
          priority: 2,
          weight: 5,
          cancelReason: undefined,
          startDate: '2099-01-01T00:00:00.000Z',
          endDate: undefined,
          deadline: '2099-02-01T00:00:00.000Z',
          status: TaskStatus.IN_PROGRESS,
          recurrence: 'weekly',
        },
      });
    });

    test('should throw when startDate after deadline', async () => {
      const userId = 33;
      const taskId = 4013;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, status: TaskStatus.NOT_STARTED }),
      );

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Updated',
          description: 'Updated desc',
          priority: 2,
          weight: 3,
          startDate: '2099-02-01T00:00:00.000Z',
          deadline: '2099-01-01T00:00:00.000Z',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(
          GoalReplaceTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'startDate' },
      });
    });

    test('should throw when task status not replaceable', async () => {
      const userId = 34;
      const taskId = 4014;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, status: TaskStatus.DELETED }),
      );

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Updated',
          priority: 2,
          weight: 3,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(
          GoalReplaceTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status', taskId },
      });
    });

    test('should throw when task status allows partial replace but fields differ', async () => {
      const userId = 35;
      const taskId = 4015;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, status: TaskStatus.COMPLETED, weight: 1 }),
      );

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Updated',
          priority: 2,
          weight: 4,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(
          GoalReplaceTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'weight', taskId },
      });
    });

    test('should throw when task missing', async () => {
      const userId = 32;
      const taskId = 4012;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Updated',
          priority: 2,
          weight: 3,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(
          GoalReplaceTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.replaceTask).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });
  });

  describe(`${GoalUpdateInboxTask.pattern}`, () => {
    test('should update inbox task', async () => {
      const userId = 40;
      const taskId = 5001;
      const existingTask = getTask({ id: taskId, userId, name: 'Old', weight: 4 });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: true,
        inboxId: 777,
      });
      tasksWriteRepoMock.replaceTask.mockImplementation((task: Task) => task);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, name: 'Inbox Updated', weight: 4, priority: 1 }),
      );

      const payload: GoalUpdateInboxTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Inbox Updated',
          description: 'Updated inbox',
          priority: 1,
          deadline: '2099-05-01T00:00:00.000Z',
        },
      });

      const res = await sendMessage<GoalUpdateInboxTask.Response, GoalUpdateInboxTask.Request>(
        GoalUpdateInboxTask.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(2);
      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      const [[updatedTaskArg, trxArg]] = tasksWriteRepoMock.replaceTask.mock.calls;
      expect(updatedTaskArg).toBeInstanceOf(Task);
      expect(updatedTaskArg.id).toBe(taskId);
      expect(updatedTaskArg.name).toBe('Inbox Updated');
      expect(updatedTaskArg.description).toBe('Updated inbox');
      expect(updatedTaskArg.priority).toBe(1);
      expect(updatedTaskArg.weight).toBe(4);
      expect(updatedTaskArg.deadline).toBe('2099-05-01T00:00:00.000Z');
      expect(trxArg).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          id: taskId,
          userId,
          name: 'Inbox Updated',
          priority: 1,
          weight: 4,
          status: existingTask.status,
        },
      });
    });

    test('should throw when task status not replaceable', async () => {
      const userId = 44;
      const taskId = 5005;

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, status: TaskStatus.DELETED }),
      );
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: true,
        inboxId: 777,
      });

      const payload: GoalUpdateInboxTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Inbox Updated',
          priority: 1,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalUpdateInboxTask.Response, GoalUpdateInboxTask.Request>(
          GoalUpdateInboxTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(nthArgs(1, inboxReadRepoMock.ensureTaskInInbox)).toEqual(expectTransaction());
      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status', taskId },
      });
    });

    test('should throw when task missing', async () => {
      const userId = 41;
      const taskId = 5002;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalUpdateInboxTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Inbox Updated',
          priority: 2,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalUpdateInboxTask.Response, GoalUpdateInboxTask.Request>(
          GoalUpdateInboxTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(inboxReadRepoMock.ensureTaskInInbox).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });

    test('should throw when inbox missing', async () => {
      const userId = 42;
      const taskId = 5003;
      const existingTask = getTask({ id: taskId, userId, name: 'Old' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: false,
        inboxId: Number.NaN,
      });

      const payload: GoalUpdateInboxTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Inbox Updated',
          priority: 2,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalUpdateInboxTask.Response, GoalUpdateInboxTask.Request>(
          GoalUpdateInboxTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.replaceTask).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.inboxNotExist.code,
        key: 'INBOX_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: {},
      });
    });

    test('should throw when task not in inbox', async () => {
      const userId = 43;
      const taskId = 5004;
      const existingTask = getTask({ id: taskId, userId, name: 'Old' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: false,
        inboxId: 123,
      });

      const payload: GoalUpdateInboxTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Inbox Updated',
          priority: 2,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalUpdateInboxTask.Response, GoalUpdateInboxTask.Request>(
          GoalUpdateInboxTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.replaceTask).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotInGroup.code,
        key: 'TASK_NOT_IN_GROUP',
        kind: RmqErrorKind.NOT_FOUND,
        details: {
          taskId,
          groupId: 123,
          message: 'Task is not in IN BOX',
        },
      });
    });

    test('should throw when updated inbox task missing after write', async () => {
      const userId = 45;
      const taskId = 5006;

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, name: 'Old', weight: 3 }),
      );
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: true,
        inboxId: 777,
      });
      tasksWriteRepoMock.replaceTask.mockImplementation((task: Task) => task);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalUpdateInboxTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Inbox Updated',
          priority: 2,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalUpdateInboxTask.Response, GoalUpdateInboxTask.Request>(
          GoalUpdateInboxTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(2);
      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(1);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskCreationFailed.code,
        key: 'TASK_CREATION_FAILED',
        kind: RmqErrorKind.INTERNAL,
        details: { taskId },
      });
    });
  });

  describe(`${GoalDeleteTask.pattern}`, () => {
    test('should delete task', async () => {
      const userId = 50;
      const taskId = 6001;
      const existingTask = getTask({ id: taskId, userId, name: 'Delete' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      tasksWriteRepoMock.changeTaskStatus.mockResolvedValueOnce(undefined);

      const payload: GoalDeleteTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
        },
      });

      const res = await sendMessage<GoalDeleteTask.Response, GoalDeleteTask.Request>(
        GoalDeleteTask.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      const [[updatedTaskArg, trxArg]] = tasksWriteRepoMock.changeTaskStatus.mock.calls;
      expect(updatedTaskArg).toBeInstanceOf(Task);
      expect(updatedTaskArg.id).toBe(taskId);
      expect(trxArg).toEqual(expectTransaction());
      expect(res).toEqual({ data: { id: taskId } });
    });

    test('should throw when task status not deleteable', async () => {
      const userId = 52;
      const taskId = 6003;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, status: TaskStatus.DELETED }),
      );

      const payload: GoalDeleteTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalDeleteTask.Response, GoalDeleteTask.Request>(
          GoalDeleteTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(firstArg(tasksWriteRepoMock.getTaskById)).toEqual({ taskId, userId });
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(tasksWriteRepoMock.changeTaskStatus).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status', taskId },
      });
    });

    test('should throw when task missing', async () => {
      const userId = 51;
      const taskId = 6002;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalDeleteTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalDeleteTask.Response, GoalDeleteTask.Request>(
          GoalDeleteTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.changeTaskStatus).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });
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
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: groupId, user_id: userId }),
      );
      tasksWriteRepoMock.addTaskToGroup.mockResolvedValueOnce(undefined);

      const payload: GoalAssignTaskToGroup.Request = buildPayload({
        data: {
          taskId,
          userId,
          groupId,
        },
      });

      const res = await sendMessage<GoalAssignTaskToGroup.Response, GoalAssignTaskToGroup.Request>(
        GoalAssignTaskToGroup.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(groupReadRepoMock.ensureTaskInGroup).toHaveBeenCalledWith(
        { taskId, userId, groupId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.removeTaskFromGroup).toHaveBeenCalledWith(
        { taskId },
        expectTransaction(),
      );
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledWith(
        { taskId, groupId },
        expectTransaction(),
      );
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
          taskId,
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
          taskId,
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

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
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
          taskId,
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
          taskId,
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

      expect(tasksWriteRepoMock.removeTaskFromGroup).toHaveBeenCalledWith(
        { taskId },
        expectTransaction(),
      );
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId },
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

  describe(`${GoalUnassignTaskFromGroup.pattern}`, () => {
    test('should unassign task from group', async () => {
      const userId = 70;
      const taskId = 8001;
      const groupId = 910;
      const existingTask = getTask({ id: taskId, userId, name: 'Unassign' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValueOnce(true);
      tasksWriteRepoMock.removeTaskFromGroup.mockResolvedValueOnce(undefined);

      const payload: GoalUnassignTaskFromGroup.Request = buildPayload({
        data: {
          taskId,
          userId,
          groupId,
        },
      });

      const res = await sendMessage<
        GoalUnassignTaskFromGroup.Response,
        GoalUnassignTaskFromGroup.Request
      >(GoalUnassignTaskFromGroup.pattern, payload);

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(groupReadRepoMock.ensureTaskInGroup).toHaveBeenCalledWith(
        { taskId, userId, groupId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.removeTaskFromGroup).toHaveBeenCalledWith(
        { taskId },
        expectTransaction(),
      );
      expect(res).toEqual({ data: { success: true } });
    });

    test('should throw when task status not unassignable', async () => {
      const userId = 73;
      const taskId = 8004;
      const groupId = 913;
      const existingTask = getTask({ id: taskId, userId, status: TaskStatus.COMPLETED });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValueOnce(true);

      const payload: GoalUnassignTaskFromGroup.Request = buildPayload({
        data: {
          taskId,
          userId,
          groupId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalUnassignTaskFromGroup.Response, GoalUnassignTaskFromGroup.Request>(
          GoalUnassignTaskFromGroup.pattern,
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
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status', taskId },
      });
    });

    test('should throw when task missing', async () => {
      const userId = 71;
      const taskId = 8002;
      const groupId = 911;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalUnassignTaskFromGroup.Request = buildPayload({
        data: {
          taskId,
          userId,
          groupId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalUnassignTaskFromGroup.Response, GoalUnassignTaskFromGroup.Request>(
          GoalUnassignTaskFromGroup.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(groupReadRepoMock.ensureTaskInGroup).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });

    test('should throw when task not in group', async () => {
      const userId = 72;
      const taskId = 8003;
      const groupId = 912;
      const existingTask = getTask({ id: taskId, userId, name: 'Unassign' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      groupReadRepoMock.ensureTaskInGroup.mockResolvedValueOnce(false);

      const payload: GoalUnassignTaskFromGroup.Request = buildPayload({
        data: {
          taskId,
          userId,
          groupId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalUnassignTaskFromGroup.Response, GoalUnassignTaskFromGroup.Request>(
          GoalUnassignTaskFromGroup.pattern,
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
        code: exceptionCode.taskNotInGroup.code,
        key: 'TASK_NOT_IN_GROUP',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId, groupId },
      });
    });
  });

  describe(`${GoalGetTasks.pattern}`, () => {
    test('should return tasks with nextPage true and full filters', async () => {
      const userId = 88;
      const taskA = getTaskView({
        id: 8801,
        userId,
        name: 'Task A',
        description: 'A',
        priority: 2,
        weight: 2,
        startDate: '2026-03-02T00:00:00.000Z',
        deadline: '2026-03-10T00:00:00.000Z',
        recurrence: 'weekly',
      });
      const taskB = getTaskView({
        id: 8802,
        userId,
        name: 'Task B',
        description: 'B',
        priority: 3,
        weight: 3,
        startDate: '2026-03-03T00:00:00.000Z',
        deadline: '2026-03-11T00:00:00.000Z',
        recurrence: 'daily',
      });
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([taskA, taskB]);

      const payload: GoalGetTasks.Request = buildPayload({
        data: {
          userId,
          search: 'Task',
          filter: {
            group: [700],
            priority: 2,
            status: [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS],
            from: '2026-03-01T00:00:00.000Z',
            to: '2026-03-31T23:59:59.000Z',
          },
          sort: {
            deadline: 'DESC',
            priority: 'ASC',
          },
          page: 1,
          perPage: 2,
        },
      });

      const res = await sendMessage<GoalGetTasks.Response, GoalGetTasks.Request>(
        GoalGetTasks.pattern,
        payload,
      );

      expect(tasksReadRepoMock.getByRange).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(tasksReadRepoMock.getByRange))).toMatchInlineSnapshot(`
        "AND(
          tasks.byUserId,
          tasks.bySearch,
          tasks.byGroupId,
          tasks.byPriority,
          tasks.byStatus,
          tasks.byStartDate,
          tasks.byDeadline
        )"
      `);
      expect(nthArgs(3, tasksReadRepoMock.getByRange)).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          items: [
            {
              id: taskA.id,
              userId: taskA.userId,
              name: taskA.name,
              description: taskA.description,
              priority: taskA.priority,
              weight: taskA.weight,
              startDate: taskA.startDate,
              deadline: taskA.deadline,
              status: taskA.status,
              recurrence: taskA.recurrence,
            },
            {
              id: taskB.id,
              userId: taskB.userId,
              name: taskB.name,
              description: taskB.description,
              priority: taskB.priority,
              weight: taskB.weight,
              startDate: taskB.startDate,
              deadline: taskB.deadline,
              status: taskB.status,
              recurrence: taskB.recurrence,
            },
          ],
          meta: { nextPage: true },
        },
      });
    });

    test('should return tasks with nextPage false when items less than perPage', async () => {
      const userId = 89;
      const task = getTaskView({
        id: 8901,
        userId,
        name: 'Single Task',
        description: 'One',
        priority: 4,
        weight: 5,
        startDate: '2026-04-01T00:00:00.000Z',
        deadline: '2026-04-10T00:00:00.000Z',
      });
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([task]);

      const payload: GoalGetTasks.Request = buildPayload({
        data: {
          userId,
          page: 2,
          perPage: 5,
        },
      });

      const res = await sendMessage<GoalGetTasks.Response, GoalGetTasks.Request>(
        GoalGetTasks.pattern,
        payload,
      );

      expect(tasksReadRepoMock.getByRange).toHaveBeenCalledTimes(1);
      expect(specToDebugString(firstArg(tasksReadRepoMock.getByRange))).toMatchInlineSnapshot(`
        "AND(
          tasks.byUserId
        )"
      `);
      expect(nthArgs(3, tasksReadRepoMock.getByRange)).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          items: [
            {
              id: task.id,
              userId: task.userId,
              name: task.name,
              description: task.description,
              priority: task.priority,
              weight: task.weight,
              startDate: task.startDate,
              deadline: task.deadline,
              status: task.status,
            },
          ],
          meta: { nextPage: false },
        },
      });
    });
  });

  describe(`${GoalGetAssignableTasks.pattern}`, () => {
    test('should return assignable tasks', async () => {
      const userId = 90;
      const groupId = 120;
      const taskView = getTaskView({ id: 9010, userId, name: 'Assignable' });

      tasksReadRepoMock.getMany.mockResolvedValueOnce([taskView]);

      const payload: GoalGetAssignableTasks.Request = buildPayload({
        data: {
          userId,
          groupId,
          search: 'Assign',
        },
      });

      const res = await sendMessage<
        GoalGetAssignableTasks.Response,
        GoalGetAssignableTasks.Request
      >(GoalGetAssignableTasks.pattern, payload);

      expect(tasksReadRepoMock.getMany).toHaveBeenCalledTimes(1);
      const [, specArg, tasksTrx] = tasksReadRepoMock.getMany.mock.calls[0];
      expect(tasksTrx).toEqual(expectTransaction());
      expect(specToDebugString(specArg)).toMatchInlineSnapshot(`
          "AND(
            tasks.byUserId,
            tasks.byStatus,
            NOT(
              tasks.inGroup
            ),
            tasks.bySearch
          )"
      `);
      expect(res).toEqual({ data: [toTaskResponse(taskView)] });
    });
  });

  describe(`${GoalFinishTask.pattern}`, () => {
    test('should finish task and remove from inbox', async () => {
      const userId = 95;
      const taskId = 9100;
      const existingTask = getTask({ id: taskId, userId, name: 'Finish task' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      tasksWriteRepoMock.replaceTask.mockResolvedValueOnce(undefined);
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: true,
        inboxId: 1001,
      });
      tasksWriteRepoMock.removeTaskFromGroup.mockResolvedValueOnce(undefined);

      const payload: GoalFinishTask.Request = buildPayload({
        data: { userId, taskId },
      });

      const res = await sendMessage<GoalFinishTask.Response, GoalFinishTask.Request>(
        GoalFinishTask.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      const [, getTaskTrx] = tasksWriteRepoMock.getTaskById.mock.calls[0];
      expect(getTaskTrx).toEqual(expectTransaction());
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(1);
      const [, replaceTrx] = tasksWriteRepoMock.replaceTask.mock.calls[0];
      expect(replaceTrx).toEqual(expectTransaction());
      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.removeTaskFromGroup).toHaveBeenCalledTimes(1);
      expect(res).toEqual({ data: true });
    });

    test('should finish task without removing from inbox', async () => {
      const userId = 96;
      const taskId = 9101;
      const existingTask = getTask({ id: taskId, userId, name: 'Finish task' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      tasksWriteRepoMock.replaceTask.mockResolvedValueOnce(undefined);
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: false,
        inboxId: 1002,
      });

      const payload: GoalFinishTask.Request = buildPayload({
        data: { userId, taskId },
      });

      const res = await sendMessage<GoalFinishTask.Response, GoalFinishTask.Request>(
        GoalFinishTask.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(1);
      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.removeTaskFromGroup).not.toHaveBeenCalled();
      expect(res).toEqual({ data: true });
    });

    test('should throw when task status not finishable', async () => {
      const userId = 99;
      const taskId = 9104;
      const existingTask = getTask({ id: taskId, userId, status: TaskStatus.DELETED });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);

      const payload: GoalFinishTask.Request = buildPayload({
        data: { userId, taskId },
      });

      let error: unknown;
      try {
        await sendMessage<GoalFinishTask.Response, GoalFinishTask.Request>(
          GoalFinishTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(0);
      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status', taskId },
      });
    });

    test('should throw when task missing', async () => {
      const userId = 97;
      const taskId = 9102;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalFinishTask.Request = buildPayload({
        data: { userId, taskId },
      });

      let error: unknown;
      try {
        await sendMessage<GoalFinishTask.Response, GoalFinishTask.Request>(
          GoalFinishTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).not.toHaveBeenCalled();
      expect(inboxReadRepoMock.ensureTaskInInbox).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });

    test('should throw when inbox missing', async () => {
      const userId = 98;
      const taskId = 9103;
      const existingTask = getTask({ id: taskId, userId, name: 'Finish task' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      tasksWriteRepoMock.replaceTask.mockResolvedValueOnce(undefined);
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: false,
        inboxId: Number.NaN,
      });

      const payload: GoalFinishTask.Request = buildPayload({
        data: { userId, taskId },
      });

      let error: unknown;
      try {
        await sendMessage<GoalFinishTask.Response, GoalFinishTask.Request>(
          GoalFinishTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(1);
      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.removeTaskFromGroup).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.inboxNotExist.code,
        key: 'INBOX_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: {},
      });
    });
  });
});
