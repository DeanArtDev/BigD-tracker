import { Task } from '@/modules/tasks/domain';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import {
  GoalAssignTaskToInbox,
  GoalCreateTaskInInbox,
  TaskStatus,
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
  nthArgs,
  sendMessageBuilder,
  unwrapRpcError,
} from '@shared/__tests__';
import { getGroupInboxView, getTask, getTaskView } from '@shared/__tests__/entities';
import { initTestEnvironment } from '@/../jest.setup';
import {
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

describe('TasksInboxRmqController (rmq e2e)', () => {
  let ms: INestMicroservice;
  let client: ClientProxy;
  let sendMessage: ReturnType<typeof sendMessageBuilder>;

  beforeAll(async () => {
    const moduleRef = await createTestingModule()
      .overrideProvider(TasksToken.WRITE_REPOSITORY)
      .useValue(tasksWriteRepoMock)
      .overrideProvider(TasksToken.READ_REPOSITORY)
      .useValue(tasksReadRepoMock)
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

  describe(`${GoalCreateTaskInInbox.pattern}`, () => {
    test('should create task in inbox', async () => {
      const userId = 101;
      const createdTask = getTask({ id: 9001, userId, name: 'Inbox Task', weight: 2 });
      const inboxGroup = getGroupInboxView({ id: 777, userId });
      const taskView = getTaskView({ id: createdTask.id, userId, name: createdTask.name });

      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(createdTask);
      inboxReadRepoMock.getInboxWithTasksByUserId.mockResolvedValueOnce(inboxGroup);
      tasksWriteRepoMock.addTaskToGroup.mockResolvedValueOnce(undefined);
      tasksReadRepoMock.getById.mockResolvedValueOnce(taskView);

      const payload: GoalCreateTaskInInbox.Request = buildPayload({
        data: {
          userId,
          name: 'Inbox Task',
          priority: 2,
          weight: 2,
        },
      });

      const res = await sendMessage<GoalCreateTaskInInbox.Response, GoalCreateTaskInInbox.Request>(
        GoalCreateTaskInInbox.pattern,
        payload,
      );

      const [[createdTaskArg, trxArg]] = tasksWriteRepoMock.createTask.mock.calls;
      expect(createdTaskArg).toBeInstanceOf(Task);
      expect(createdTaskArg.id).toEqual(NaN);
      expect(createdTaskArg.userId).toBe(userId);
      expect(createdTaskArg.name).toBe('Inbox Task');
      expect(trxArg).toEqual(expectTransaction());
      expect(inboxReadRepoMock.getInboxWithTasksByUserId).toHaveBeenCalledWith(
        { userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledWith(
        { taskId: createdTask.id, groupId: inboxGroup.id },
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

    test('should throw when deadline in past', async () => {
      const userId = 104;
      const payload: GoalCreateTaskInInbox.Request = buildPayload({
        data: {
          userId,
          name: 'Inbox Task',
          priority: 2,
          deadline: '2000-01-01T00:00:00.000Z',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTaskInInbox.Response, GoalCreateTaskInInbox.Request>(
          GoalCreateTaskInInbox.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(0);
      expect(inboxReadRepoMock.getInboxWithTasksByUserId).toHaveBeenCalledTimes(0);
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledTimes(0);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'deadline' },
      });
    });

    test('should throw when inbox missing', async () => {
      const userId = 102;
      const createdTask = getTask({ id: 9002, userId, name: 'Inbox Task' });

      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(createdTask);
      inboxReadRepoMock.getInboxWithTasksByUserId.mockResolvedValueOnce(null);

      const payload: GoalCreateTaskInInbox.Request = buildPayload({
        data: {
          userId,
          name: 'Inbox Task',
          priority: 2,
          weight: 2,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTaskInInbox.Response, GoalCreateTaskInInbox.Request>(
          GoalCreateTaskInInbox.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(inboxReadRepoMock.getInboxWithTasksByUserId).toHaveBeenCalledWith(
        { userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.addTaskToGroup).not.toHaveBeenCalled();
      expect(tasksReadRepoMock.getById).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.inboxNotExist.code,
        key: 'INBOX_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: {},
      });
    });

    test('should throw when task view missing', async () => {
      const userId = 103;
      const createdTask = getTask({ id: 9003, userId, name: 'Inbox Task' });
      const inboxGroup = getGroupInboxView({ id: 778, userId });

      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(createdTask);
      inboxReadRepoMock.getInboxWithTasksByUserId.mockResolvedValueOnce(inboxGroup);
      tasksWriteRepoMock.addTaskToGroup.mockResolvedValueOnce(undefined);
      tasksReadRepoMock.getById.mockResolvedValueOnce(null);

      const payload: GoalCreateTaskInInbox.Request = buildPayload({
        data: {
          userId,
          name: 'Inbox Task',
          priority: 2,
          weight: 2,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTaskInInbox.Response, GoalCreateTaskInInbox.Request>(
          GoalCreateTaskInInbox.pattern,
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
      const userId = 105;
      const createdTask = getTask({ id: 9004, userId, name: 'Inbox Task' });

      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalCreateTaskInInbox.Request = buildPayload({
        data: {
          userId,
          name: 'Inbox Task',
          priority: 2,
          weight: 2,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTaskInInbox.Response, GoalCreateTaskInInbox.Request>(
          GoalCreateTaskInInbox.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(inboxReadRepoMock.getInboxWithTasksByUserId).toHaveBeenCalledTimes(0);
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledTimes(0);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskCreationFailed.code,
        key: 'TASK_CREATION_FAILED',
        kind: RmqErrorKind.INTERNAL,
        details: { taskId: createdTask.id },
      });
    });
  });

  describe(`${GoalAssignTaskToInbox.pattern}`, () => {
    test('should assign task to inbox', async () => {
      const userId = 110;
      const taskId = 9101;
      const existingTask = getTask({ id: taskId, userId, name: 'Assign Inbox' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: false,
        inboxId: 900,
      });
      tasksWriteRepoMock.removeTaskFromGroup.mockResolvedValueOnce(undefined);
      tasksWriteRepoMock.addTaskToGroup.mockResolvedValueOnce(undefined);

      const payload: GoalAssignTaskToInbox.Request = buildPayload({
        data: {
          userId,
          taskId,
        },
      });

      const res = await sendMessage<GoalAssignTaskToInbox.Response, GoalAssignTaskToInbox.Request>(
        GoalAssignTaskToInbox.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledWith(
        { taskId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.removeTaskFromGroup).toHaveBeenCalledWith(
        { taskId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledWith(
        { taskId, groupId: 900 },
        expectTransaction(),
      );
      expect(res).toEqual({ data: { success: true } });
    });

    test('should throw when task status not assignable', async () => {
      const userId = 114;
      const taskId = 9105;
      const existingTask = getTask({ id: taskId, userId, status: TaskStatus.COMPLETED });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: false,
        inboxId: 902,
      });

      const payload: GoalAssignTaskToInbox.Request = buildPayload({
        data: {
          userId,
          taskId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalAssignTaskToInbox.Response, GoalAssignTaskToInbox.Request>(
          GoalAssignTaskToInbox.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(nthArgs(1, inboxReadRepoMock.ensureTaskInInbox)).toEqual(expectTransaction());
      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.removeTaskFromGroup).toHaveBeenCalledTimes(0);
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status', taskId },
      });
    });

    test('should throw when task missing', async () => {
      const userId = 111;
      const taskId = 9102;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalAssignTaskToInbox.Request = buildPayload({
        data: {
          userId,
          taskId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalAssignTaskToInbox.Response, GoalAssignTaskToInbox.Request>(
          GoalAssignTaskToInbox.pattern,
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
      const userId = 112;
      const taskId = 9103;
      const existingTask = getTask({ id: taskId, userId, name: 'Assign Inbox' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: false,
        inboxId: Number.NaN,
      });

      const payload: GoalAssignTaskToInbox.Request = buildPayload({
        data: {
          userId,
          taskId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalAssignTaskToInbox.Response, GoalAssignTaskToInbox.Request>(
          GoalAssignTaskToInbox.pattern,
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
      expect(tasksWriteRepoMock.addTaskToGroup).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.inboxNotExist.code,
        key: 'INBOX_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: {},
      });
    });

    test('should throw when task already in inbox', async () => {
      const userId = 113;
      const taskId = 9104;
      const existingTask = getTask({ id: taskId, userId, name: 'Assign Inbox' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: true,
        inboxId: 901,
      });

      const payload: GoalAssignTaskToInbox.Request = buildPayload({
        data: {
          userId,
          taskId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalAssignTaskToInbox.Response, GoalAssignTaskToInbox.Request>(
          GoalAssignTaskToInbox.pattern,
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
      expect(tasksWriteRepoMock.removeTaskFromGroup).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskAlreadyInGroup.code,
        key: 'TASK_ALREADY_IN_GROUP',
        kind: RmqErrorKind.ALREADY_EXISTS,
        details: {
          taskId,
          groupId: 901,
          message: 'Task is already in IN BOX',
        },
      });
    });
  });
});
