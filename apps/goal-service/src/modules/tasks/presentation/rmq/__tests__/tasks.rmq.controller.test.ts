import { Task } from '@/modules/tasks/domain';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import {
  GoalAssignTaskToGroup,
  GoalCloneTask,
  GoalCreateTask,
  GoalDeleteTask,
  GoalGetDiaryTasks,
  GoalGetAssignableTasksToGroup,
  GoalReplaceTask,
  GoalUnassignTaskFromGroup,
  GoalUpdateInboxTask,
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
import { getGroupWithTasks, getTask, getTaskView } from '@shared/__tests__/entities';
import { initTestEnvironment } from '@/../jest.setup';
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
      expect(res).toEqual({ data: toTaskResponse(taskView) });
    });

    test('should create task with group', async () => {
      const userId = 11;
      const groupId = 201;
      const createdTask = getTask({ id: 55, userId, name: 'Task B' });
      const taskView = getTaskView({ id: createdTask.id, userId, name: createdTask.name });

      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
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
      expect(res).toEqual({ data: toTaskResponse(taskView) });
    });

    test('should throw when group missing', async () => {
      const userId = 12;
      const groupId = 300;
      const createdTask = getTask({ id: 60, userId, name: 'Task C' });
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
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
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotFound.code,
        key: 'TASK_NOT_FOUNT',
        kind: RmqErrorKind.NOT_FOUND,
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
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotFound.code,
        key: 'TASK_NOT_FOUNT',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId: clonedTask.id },
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
          status: existingTask.status,
          recurrence: 'weekly',
        },
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
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
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
          description: 'Updated inbox',
          priority: 1,
          weight: 4,
          cancelReason: undefined,
          startDate: undefined,
          endDate: undefined,
          deadline: '2099-05-01T00:00:00.000Z',
          status: existingTask.status,
          recurrence: undefined,
        },
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

  describe(`${GoalGetDiaryTasks.pattern}`, () => {
    test('should return diary tasks', async () => {
      const userId = 81;
      const taskView = getTaskView({ id: 9005, userId, name: 'Diary task' });
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([taskView]);

      const payload: GoalGetDiaryTasks.Request = buildPayload({
        data: {
          userId,
          from: '2024-01-01T00:00:00.000Z',
          to: '2024-01-31T00:00:00.000Z',
        },
      });

      const res = await sendMessage<GoalGetDiaryTasks.Response, GoalGetDiaryTasks.Request>(
        GoalGetDiaryTasks.pattern,
        payload,
      );

      expect(tasksReadRepoMock.getByRange).toHaveBeenCalledTimes(1);
      const [, trxArg] = tasksReadRepoMock.getByRange.mock.calls[0];
      expect(trxArg).toEqual(expectTransaction());
      expect(res).toEqual({ data: [toTaskResponse(taskView)] });
    });
  });

  describe(`${GoalGetAssignableTasksToGroup.pattern}`, () => {
    test('should return assignable tasks', async () => {
      const userId = 90;
      const groupId = 120;
      const taskView = getTaskView({ id: 9010, userId, name: 'Assignable' });

      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: groupId, user_id: userId }),
      );
      tasksReadRepoMock.getMany.mockResolvedValueOnce([taskView]);

      const payload: GoalGetAssignableTasksToGroup.Request = buildPayload({
        data: {
          userId,
          groupId,
          search: 'Assign',
        },
      });

      const res = await sendMessage<
        GoalGetAssignableTasksToGroup.Response,
        GoalGetAssignableTasksToGroup.Request
      >(GoalGetAssignableTasksToGroup.pattern, payload);

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(1);
      const [, groupTrx] = groupWriteRepoMock.getGroupById.mock.calls[0];
      expect(groupTrx).toEqual(expectTransaction());
      expect(tasksReadRepoMock.getMany).toHaveBeenCalledTimes(1);
      const [, , tasksTrx] = tasksReadRepoMock.getMany.mock.calls[0];
      expect(tasksTrx).toEqual(expectTransaction());
      expect(res).toEqual({ data: [toTaskResponse(taskView)] });
    });

    test('should throw when group missing', async () => {
      const userId = 91;
      const groupId = 121;

      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(null);

      const payload: GoalGetAssignableTasksToGroup.Request = buildPayload({
        data: {
          userId,
          groupId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<
          GoalGetAssignableTasksToGroup.Response,
          GoalGetAssignableTasksToGroup.Request
        >(GoalGetAssignableTasksToGroup.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(1);
      const [, groupTrx] = groupWriteRepoMock.getGroupById.mock.calls[0];
      expect(groupTrx).toEqual(expectTransaction());
      expect(tasksReadRepoMock.getMany).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.groupNotExist.code,
        key: 'GROUP_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { groupId },
      });
    });
  });
});
