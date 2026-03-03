import { initTestEnvironment } from '@/../jest.setup';
import { TaskIdBuilder } from '@/modules/tasks/domain';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalCompleteDeleteTask, RmqErrorKind, TaskStatus } from '@big-d/api-contracts';
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

describe('TasksRmqController goal.complete-delete-task.command (rmq e2e)', () => {
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

  describe(`${GoalCompleteDeleteTask.pattern}`, () => {
    test('should complete delete task', async () => {
      const userId = 201;
      const taskId = 8201;

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(getTask({ id: taskId, userId, status: TaskStatus.DELETED }));
      tasksWriteRepoMock.deleteTask.mockResolvedValueOnce(true);

      const payload: GoalCompleteDeleteTask.Request = buildPayload({
        data: { userId, taskId: TaskIdBuilder.wrapOriginId(taskId) },
      });

      const res = await sendMessage<GoalCompleteDeleteTask.Response, GoalCompleteDeleteTask.Request>(
        GoalCompleteDeleteTask.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.deleteTask).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(nthArgs(1, tasksWriteRepoMock.deleteTask)).toEqual(expectTransaction());
      expect(res).toEqual({ data: { id: taskId } });
    });

    test('should throw when task missing', async () => {
      const userId = 202;
      const taskId = 8202;

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalCompleteDeleteTask.Request = buildPayload({
        data: { userId, taskId: TaskIdBuilder.wrapOriginId(taskId) },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCompleteDeleteTask.Response, GoalCompleteDeleteTask.Request>(
          GoalCompleteDeleteTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.deleteTask).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });

    test('should throw when task status not allowed for complete delete', async () => {
      const userId = 203;
      const taskId = 8203;

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, status: TaskStatus.NOT_STARTED }),
      );

      const payload: GoalCompleteDeleteTask.Request = buildPayload({
        data: { userId, taskId: TaskIdBuilder.wrapOriginId(taskId) },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCompleteDeleteTask.Response, GoalCompleteDeleteTask.Request>(
          GoalCompleteDeleteTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.deleteTask).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'status', taskId },
      });
    });

    test('should throw when delete affected zero rows', async () => {
      const userId = 204;
      const taskId = 8204;

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(getTask({ id: taskId, userId, status: TaskStatus.DELETED }));
      tasksWriteRepoMock.deleteTask.mockResolvedValueOnce(false);

      const payload: GoalCompleteDeleteTask.Request = buildPayload({
        data: { userId, taskId: TaskIdBuilder.wrapOriginId(taskId) },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCompleteDeleteTask.Response, GoalCompleteDeleteTask.Request>(
          GoalCompleteDeleteTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.deleteTask).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(nthArgs(1, tasksWriteRepoMock.deleteTask)).toEqual(expectTransaction());
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotFound.code,
        key: 'TASK_NOT_FOUNT',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });
  });
});
