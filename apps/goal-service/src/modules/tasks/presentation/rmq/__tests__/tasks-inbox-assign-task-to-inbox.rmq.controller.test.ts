import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { TaskIdBuilder } from '@/modules/tasks/domain';
import { GoalAssignTaskToInbox, TaskStatus, RmqErrorKind } from '@big-d/api-contracts';
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
import { initTestEnvironment } from '@/../jest.setup';
import { inboxReadRepoMock, tasksReadRepoMock, tasksWriteRepoMock } from '@shared/__tests__/repository-mocks';

initTestEnvironment();

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
          taskId: TaskIdBuilder.wrapOriginId(taskId),
        },
      });

      const res = await sendMessage<GoalAssignTaskToInbox.Response, GoalAssignTaskToInbox.Request>(
        GoalAssignTaskToInbox.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(tasksWriteRepoMock.removeTaskFromGroup).toHaveBeenCalledWith({ taskId }, expectTransaction());
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledWith({ taskId, groupId: 900 }, expectTransaction());
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
          taskId: TaskIdBuilder.wrapOriginId(taskId),
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
          taskId: TaskIdBuilder.wrapOriginId(taskId),
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

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
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
          taskId: TaskIdBuilder.wrapOriginId(taskId),
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

      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
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
          taskId: TaskIdBuilder.wrapOriginId(taskId),
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

      expect(inboxReadRepoMock.ensureTaskInInbox).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
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
