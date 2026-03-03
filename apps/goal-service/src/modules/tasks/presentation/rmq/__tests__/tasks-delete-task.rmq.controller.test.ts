import { initTestEnvironment } from '@/../jest.setup';
import { Task, TaskIdBuilder } from '@/modules/tasks/domain';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalDeleteTask, RmqErrorKind, TaskStatus } from '@big-d/api-contracts';
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

  describe(`${GoalDeleteTask.pattern}`, () => {
    test('should delete task', async () => {
      const userId = 50;
      const taskId = 6001;
      const existingTask = getTask({ id: taskId, userId, name: 'Delete' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      tasksWriteRepoMock.changeTaskStatus.mockResolvedValueOnce(undefined);

      const payload: GoalDeleteTask.Request = buildPayload({
        data: {
          taskId: TaskIdBuilder.wrapOriginId(taskId),
          userId,
        },
      });

      const res = await sendMessage<GoalDeleteTask.Response, GoalDeleteTask.Request>(GoalDeleteTask.pattern, payload);

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      const [[updatedTaskArg, trxArg]] = tasksWriteRepoMock.changeTaskStatus.mock.calls;
      expect(updatedTaskArg).toBeInstanceOf(Task);
      expect(updatedTaskArg.id).toBe(taskId);
      expect(trxArg).toEqual(expectTransaction());
      expect(res).toEqual({ data: { id: taskId } });
    });

    test('should throw when task status not deleteable', async () => {
      const userId = 52;
      const taskId = 6003;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(getTask({ id: taskId, userId, status: TaskStatus.DELETED }));

      const payload: GoalDeleteTask.Request = buildPayload({
        data: {
          taskId: TaskIdBuilder.wrapOriginId(taskId),
          userId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalDeleteTask.Response, GoalDeleteTask.Request>(GoalDeleteTask.pattern, payload);
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
          taskId: TaskIdBuilder.wrapOriginId(taskId),
          userId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalDeleteTask.Response, GoalDeleteTask.Request>(GoalDeleteTask.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(tasksWriteRepoMock.changeTaskStatus).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });
  });
});
