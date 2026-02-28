import { initTestEnvironment } from '@/../jest.setup';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalTaskRecovery, RmqErrorKind, TaskStatus } from '@big-d/api-contracts';
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
} from '@shared/__tests__/repository-mocks';

initTestEnvironment();

describe('TasksRmqController goal.task-recovery.command (rmq e2e)', () => {
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

    const resp = await connectRmqClients({ testingModule: moduleRef });
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

  describe(`${GoalTaskRecovery.pattern}`, () => {
    test('should recover task without group', async () => {
      const userId = 301;
      const taskId = 9301;

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({
          id: taskId,
          userId,
          status: TaskStatus.DELETED,
          priority: 4,
          weight: 10,
          startDate: '2099-05-01T00:00:00.000Z',
          deadline: '2099-05-02T00:00:00.000Z',
        }),
      );
      tasksWriteRepoMock.replaceTask.mockImplementation((task) => task);

      const payload: GoalTaskRecovery.Request = buildPayload({
        data: { userId, taskId },
      });

      const res = await sendMessage<GoalTaskRecovery.Response, GoalTaskRecovery.Request>(
        GoalTaskRecovery.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(1);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledTimes(0);
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(nthArgs(1, tasksWriteRepoMock.replaceTask)).toEqual(expectTransaction());
      expect(res).toEqual({ data: { id: taskId } });
    });

    test('should recover task and assign to group', async () => {
      const userId = 302;
      const taskId = 9302;
      const groupId = 777;

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, status: TaskStatus.DELETED }),
      );
      tasksWriteRepoMock.replaceTask.mockImplementation((task) => task);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: groupId, user_id: userId }),
      );
      tasksWriteRepoMock.addTaskToGroup.mockResolvedValueOnce(undefined);

      const payload: GoalTaskRecovery.Request = buildPayload({
        data: { userId, taskId, groupId },
      });

      const res = await sendMessage<GoalTaskRecovery.Response, GoalTaskRecovery.Request>(
        GoalTaskRecovery.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(1);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(nthArgs(1, tasksWriteRepoMock.replaceTask)).toEqual(expectTransaction());
      expect(nthArgs(1, groupWriteRepoMock.getGroupById)).toEqual(expectTransaction());
      expect(nthArgs(1, tasksWriteRepoMock.addTaskToGroup)).toEqual(expectTransaction());
      expect(res).toEqual({ data: { id: taskId } });
    });

    test('should throw when task missing', async () => {
      const userId = 303;
      const taskId = 9303;

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalTaskRecovery.Request = buildPayload({
        data: { userId, taskId },
      });

      let error: unknown;
      try {
        await sendMessage<GoalTaskRecovery.Response, GoalTaskRecovery.Request>(
          GoalTaskRecovery.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(0);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });

    test('should throw when task status not recoverable', async () => {
      const userId = 304;
      const taskId = 9304;

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, status: TaskStatus.IN_PROGRESS }),
      );

      const payload: GoalTaskRecovery.Request = buildPayload({
        data: { userId, taskId },
      });

      let error: unknown;
      try {
        await sendMessage<GoalTaskRecovery.Response, GoalTaskRecovery.Request>(
          GoalTaskRecovery.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(0);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status', taskId },
      });
    });

    test('should throw when target group missing', async () => {
      const userId = 305;
      const taskId = 9305;
      const groupId = 778;

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, status: TaskStatus.DELETED }),
      );
      tasksWriteRepoMock.replaceTask.mockImplementation((task) => task);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(null);

      const payload: GoalTaskRecovery.Request = buildPayload({
        data: { userId, taskId, groupId },
      });

      let error: unknown;
      try {
        await sendMessage<GoalTaskRecovery.Response, GoalTaskRecovery.Request>(
          GoalTaskRecovery.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(1);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledTimes(0);
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(nthArgs(1, tasksWriteRepoMock.replaceTask)).toEqual(expectTransaction());
      expect(nthArgs(1, groupWriteRepoMock.getGroupById)).toEqual(expectTransaction());
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.groupNotExist.code,
        key: 'GROUP_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { groupId },
      });
    });
  });
});
