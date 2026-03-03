import { initTestEnvironment } from '@/../jest.setup';
import { TaskIdBuilder } from '@/modules/tasks/domain';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalFinishTask, RmqErrorKind, TaskStatus } from '@big-d/api-contracts';
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
        data: { userId, taskId: TaskIdBuilder.wrapOriginId(taskId) },
      });

      const res = await sendMessage<GoalFinishTask.Response, GoalFinishTask.Request>(GoalFinishTask.pattern, payload);

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
        data: { userId, taskId: TaskIdBuilder.wrapOriginId(taskId) },
      });

      const res = await sendMessage<GoalFinishTask.Response, GoalFinishTask.Request>(GoalFinishTask.pattern, payload);

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
        data: { userId, taskId: TaskIdBuilder.wrapOriginId(taskId) },
      });

      let error: unknown;
      try {
        await sendMessage<GoalFinishTask.Response, GoalFinishTask.Request>(GoalFinishTask.pattern, payload);
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
        data: { userId, taskId: TaskIdBuilder.wrapOriginId(taskId) },
      });

      let error: unknown;
      try {
        await sendMessage<GoalFinishTask.Response, GoalFinishTask.Request>(GoalFinishTask.pattern, payload);
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
        data: { userId, taskId: TaskIdBuilder.wrapOriginId(taskId) },
      });

      let error: unknown;
      try {
        await sendMessage<GoalFinishTask.Response, GoalFinishTask.Request>(GoalFinishTask.pattern, payload);
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
