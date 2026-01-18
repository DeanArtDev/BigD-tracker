import {
  GroupInboxReadRepository,
  TasksReadRepository,
  TasksWriteRepository,
} from '@/modules/tasks/application/ports';
import { Task } from '@/modules/tasks/domain';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import {
  GoalAssignTaskToInbox,
  GoalCreateTaskInInbox,
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
import { getGroupInboxView, getTask, getTaskView } from '@shared/__tests__/entities';

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

const tasksWriteRepoMock: Record<keyof TasksWriteRepository, jest.Mock> = {
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  changeTaskStatus: jest.fn(),
  replaceTask: jest.fn(),
  addTaskToGroup: jest.fn(),
  removeTaskFromGroup: jest.fn(),
};

const tasksReadRepoMock: Record<keyof TasksReadRepository, jest.Mock> = {
  getById: jest.fn(),
  getTaskToGroupLink: jest.fn(),
  isTaskIntoGroup: jest.fn(),
};

const inboxReadRepoMock: Record<keyof GroupInboxReadRepository, jest.Mock> = {
  getInboxWithTasksByUserId: jest.fn(),
  ensureTaskInInbox: jest.fn(),
};

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

  beforeEach(() => {
    jest.clearAllMocks();
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
      expect(res).toEqual({ data: toTaskResponse(taskView) });
    });

    test('should throw when inbox missing', async () => {
      const userId = 102;
      const createdTask = getTask({ id: 9002, userId, name: 'Inbox Task' });

      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
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
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotFound.code,
        key: 'TASK_NOT_FOUNT',
        kind: RmqErrorKind.NOT_FOUND,
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
