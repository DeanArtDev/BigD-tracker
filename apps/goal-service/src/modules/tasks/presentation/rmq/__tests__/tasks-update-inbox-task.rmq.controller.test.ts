import { initTestEnvironment } from '@/../jest.setup';
import { Task } from '@/modules/tasks/domain';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalUpdateInboxTask, RmqErrorKind, TaskStatus } from '@big-d/api-contracts';
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
import { getTask } from '@shared/__tests__/entities';
import {
  groupReadRepoMock,
  groupWriteRepoMock,
  inboxReadRepoMock,
  tasksReadRepoMock,
  tasksWriteRepoMock,
} from '@shared/__tests__/repository-mocks';

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`${GoalUpdateInboxTask.pattern}`, () => {
    test('should update inbox task', async () => {
      const userId = 40;
      const taskId = 5001;
      const existingTask = getTask({
        id: taskId,
        userId,
        name: 'Old',
        weight: 4,
        priority: 1,
        status: TaskStatus.COMPLETED,
      });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      inboxReadRepoMock.ensureTaskInInbox.mockResolvedValueOnce({
        success: true,
        inboxId: 777,
      });
      tasksWriteRepoMock.replaceTask.mockImplementation((task: Task) => task);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({
          id: taskId,
          userId,
          name: 'Inbox Updated',
          weight: 4,
          priority: 1,
          status: TaskStatus.COMPLETED,
        }),
      );

      const payload: GoalUpdateInboxTask.Request = buildPayload({
        data: {
          id: taskId,
          userId,
          name: 'Inbox Updated',
          description: 'Updated inbox',
          priority: 1,
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
      expect(trxArg).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          id: taskId,
          userId,
          name: 'Inbox Updated',
          priority: 1,
          weight: 4,
          status: existingTask.status,
          recurrence: {},
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
        details: { field: 'priority', taskId },
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
});
