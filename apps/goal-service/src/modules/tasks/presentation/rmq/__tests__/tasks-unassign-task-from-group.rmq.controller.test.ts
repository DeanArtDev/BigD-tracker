import { initTestEnvironment } from '@/../jest.setup';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalUnassignTaskFromGroup, RmqErrorKind, TaskStatus } from '@big-d/api-contracts';
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
});
