import { initTestEnvironment } from '@/../jest.setup';
import { Task, TaskIdBuilder } from '@/modules/tasks/domain';
import { GroupsToken, TasksOverridesToken, TasksToken } from '@/modules/tasks/tokens';
import {
  GoalReplaceTask,
  RecurrenceFrequency,
  RmqErrorKind,
  TaskRecurrenceStatus,
  TaskStatus,
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
import { getTask } from '@shared/__tests__/entities';
import {
  groupReadRepoMock,
  groupWriteRepoMock,
  inboxReadRepoMock,
  tasksOverridesWriteRepoMock,
  tasksReadRepoMock,
  tasksWriteRepoMock,
} from '@shared/__tests__';

initTestEnvironment();

describe('TasksRmqController (rmq e2e)', () => {
  let ms: INestMicroservice;
  let client: ClientProxy;
  let sendMessage: ReturnType<typeof sendMessageBuilder>;

  beforeEach(() => {
    jest.resetAllMocks();
    tasksOverridesWriteRepoMock.getOneRecurrence.mockResolvedValue(null);
    tasksOverridesWriteRepoMock.getManyOverrides.mockResolvedValue([]);
    tasksOverridesWriteRepoMock.deleteManyOverride.mockResolvedValue(0);
  });

  beforeAll(async () => {
    const moduleRef = await createTestingModule()
      .overrideProvider(TasksToken.WRITE_REPOSITORY)
      .useValue(tasksWriteRepoMock)
      .overrideProvider(TasksToken.READ_REPOSITORY)
      .useValue(tasksReadRepoMock)
      .overrideProvider(TasksOverridesToken.WRITE_REPOSITORY)
      .useValue(tasksOverridesWriteRepoMock)
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

  describe(`${GoalReplaceTask.pattern}`, () => {
    test('should replace task', async () => {
      const userId = 31;
      const taskId = 4011;
      const existingTask = getTask({ id: taskId, userId, name: 'Old' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      tasksWriteRepoMock.replaceTask.mockImplementation((task: Task) => task);

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          name: 'Updated',
          description: 'Updated desc',
          priority: 2,
          weight: 5,
        },
      });

      const res = await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(
        GoalReplaceTask.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      const [[replacedTaskArg, trxArg]] = tasksWriteRepoMock.replaceTask.mock.calls;
      expect(replacedTaskArg).toBeInstanceOf(Task);
      expect(replacedTaskArg.id).toBe(taskId);
      expect(replacedTaskArg.name).toBe('Updated');
      expect(replacedTaskArg.description).toBe('Updated desc');
      expect(replacedTaskArg.priority).toBe(2);
      expect(replacedTaskArg.weight).toBe(5);
      expect(trxArg).toEqual(expectTransaction());
      expect(res).toEqual({
        data: {
          id: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          name: 'Updated',
          description: 'Updated desc',
          priority: 2,
          weight: 5,
          cancelReason: undefined,
          endDate: undefined,
          status: TaskStatus.NOT_STARTED,
          recurrence: undefined,
        },
      });
    });

    test('should replace task fields and create daily recurrence when task initially has no startDate and deadline', async () => {
      const userId = 41;
      const taskId = 4021;
      const startDate = '2026-03-10T10:00';
      const deadline = '2026-03-10T12:00';
      const existingTask = getTask({
        id: taskId,
        userId,
        name: 'Old',
        description: 'Old desc',
        priority: 1,
        weight: 2,
        status: TaskStatus.NOT_STARTED,
      });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      tasksWriteRepoMock.replaceTask.mockImplementation((task: Task) => task);
      tasksOverridesWriteRepoMock.upsertRecurrence.mockImplementation((recurrence) => recurrence);

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          name: 'Updated recurring',
          description: 'Updated desc',
          priority: 4,
          weight: 5,
          startDate,
          deadline,
          recurrence: {
            frequency: RecurrenceFrequency.DAILY,
            startDate,
          },
        },
      });

      const res = await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(
        GoalReplaceTask.pattern,
        payload,
      );

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(tasksOverridesWriteRepoMock.getOneRecurrence).toHaveBeenCalledTimes(1);

      const [[replacedTaskArg, replaceTaskTrxArg]] = tasksWriteRepoMock.replaceTask.mock.calls;
      expect(replacedTaskArg).toBeInstanceOf(Task);
      expect(replacedTaskArg.id).toBe(taskId);
      expect(replacedTaskArg.name).toBe('Updated recurring');
      expect(replacedTaskArg.description).toBe('Updated desc');
      expect(replacedTaskArg.priority).toBe(4);
      expect(replacedTaskArg.weight).toBe(5);
      expect(replacedTaskArg.startDate).toBe(startDate);
      expect(replacedTaskArg.deadline).toBe(deadline);
      expect(replacedTaskArg.endDate).toBeUndefined();
      expect(replacedTaskArg.status).toBe(TaskStatus.IN_PROGRESS);
      expect(replaceTaskTrxArg).toEqual(expectTransaction());

      const [[upsertRecurrenceArg, upsertRecurrenceTrxArg]] = tasksOverridesWriteRepoMock.upsertRecurrence.mock.calls;
      expect(upsertRecurrenceArg.taskId).toBe(taskId);
      expect(upsertRecurrenceArg.userId).toBe(userId);
      expect(upsertRecurrenceArg.startDate).toBe(startDate);
      expect(upsertRecurrenceArg.frequency.value).toBe(RecurrenceFrequency.DAILY);
      expect(upsertRecurrenceArg.status).toBe(TaskRecurrenceStatus.ACTIVE);
      expect(upsertRecurrenceTrxArg).toEqual(expectTransaction());

      expect(res).toEqual({
        data: expect.objectContaining({
          id: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          name: 'Updated recurring',
          description: 'Updated desc',
          priority: 4,
          weight: 5,
          startDate,
          deadline,
          status: TaskStatus.IN_PROGRESS,
        }),
      });
    });

    test('should throw when task status not replaceable', async () => {
      const userId = 34;
      const taskId = 4014;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(getTask({ id: taskId, userId, status: TaskStatus.DELETED }));

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          name: 'Updated',
          priority: 2,
          weight: 3,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(GoalReplaceTask.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(nthArgs(1, tasksWriteRepoMock.getTaskById)).toEqual(expectTransaction());
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'weight', taskId },
      });
    });

    test('should throw when task status allows partial replace but fields differ', async () => {
      const userId = 35;
      const taskId = 4015;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(
        getTask({ id: taskId, userId, status: TaskStatus.COMPLETED, weight: 1 }),
      );

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          name: 'Updated',
          priority: 2,
          weight: 4,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(GoalReplaceTask.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.replaceTask).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'weight', taskId },
      });
    });

    test('should throw when task missing', async () => {
      const userId = 32;
      const taskId = 4012;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: TaskIdBuilder.wrapOriginId(taskId),
          userId,
          name: 'Updated',
          priority: 2,
          weight: 3,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(GoalReplaceTask.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(tasksWriteRepoMock.replaceTask).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });

    test('should throw unprocessable when task id is invalid', async () => {
      const userId = 37;
      const invalidTaskId = 'bad-id';

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: invalidTaskId,
          userId,
          name: 'Updated',
          priority: 2,
          weight: 3,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(GoalReplaceTask.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).not.toHaveBeenCalled();
      expect(tasksWriteRepoMock.replaceTask).not.toHaveBeenCalled();
      expect(tasksOverridesWriteRepoMock.getOneRecurrence).not.toHaveBeenCalled();
      expect(tasksOverridesWriteRepoMock.upsertOverride).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskUnprocessable.code,
        key: 'TASK_UNPROCESSABLE',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { taskId: invalidTaskId, message: 'Не валидный id' },
      });
    });

    test('should reject recurrence for virtual task replace', async () => {
      const userId = 38;
      const virtualTaskId = TaskIdBuilder.wrapVirtualId({
        recurrenceId: 991,
        date: '2026-03-02T10:15:00.000Z',
      });

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: virtualTaskId,
          userId,
          name: 'Updated',
          priority: 2,
          weight: 3,
          recurrence: {
            frequency: RecurrenceFrequency.DAILY,
            startDate: '2026-03-02T10:15:00.000Z',
          },
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(GoalReplaceTask.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(tasksOverridesWriteRepoMock.getOneRecurrence).not.toHaveBeenCalled();
      expect(tasksWriteRepoMock.getTaskById).not.toHaveBeenCalled();
      expect(tasksOverridesWriteRepoMock.upsertOverride).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'recurrence' },
      });
    });

    test('should reject recurrence for override task replace', async () => {
      const userId = 39;
      const overrideTaskId = TaskIdBuilder.wrapOverrideId({
        recurrenceId: 992,
        overrideId: 993,
        date: '2026-03-02T10:15:00.000Z',
      });

      const payload: GoalReplaceTask.Request = buildPayload({
        data: {
          id: overrideTaskId,
          userId,
          name: 'Updated',
          priority: 2,
          weight: 3,
          recurrence: {
            frequency: RecurrenceFrequency.DAILY,
            startDate: '2026-03-02T10:15:00.000Z',
          },
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalReplaceTask.Response, GoalReplaceTask.Request>(GoalReplaceTask.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(tasksOverridesWriteRepoMock.getOneRecurrence).not.toHaveBeenCalled();
      expect(tasksWriteRepoMock.getTaskById).not.toHaveBeenCalled();
      expect(tasksOverridesWriteRepoMock.getOneOverride).not.toHaveBeenCalled();
      expect(tasksOverridesWriteRepoMock.upsertOverride).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'recurrence' },
      });
    });
  });
});
