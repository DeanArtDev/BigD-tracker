import { initTestEnvironment } from '@/../jest.setup';
import { Task, TaskIdBuilder, TaskOverride } from '@/modules/tasks/domain';
import { GroupsToken, TasksOverridesToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalDeleteTask, RmqErrorKind, TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { exceptionCode } from '@big-d/exceptions';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeAndDate } from '@shared/date-and-time';
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
import { getTask, getTaskRecurrence } from '@shared/__tests__/entities';
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
    jest.clearAllMocks();
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

    test('should delete virtual task by creating override', async () => {
      const userId = 53;
      const taskId = 7001;
      const recurrenceId = 9001;
      const recurrenceStart = '2026-03-12T10:00:00.000Z';
      const virtualTaskId = TaskIdBuilder.wrapVirtualId({ recurrenceId, date: recurrenceStart });

      const existingTask = getTask({
        id: taskId,
        userId,
        name: 'Virtual source',
        startDate: recurrenceStart,
        deadline: '2026-03-12T12:00:00.000Z',
        status: TaskStatus.IN_PROGRESS,
      });
      const recurrence = getTaskRecurrence({
        id: recurrenceId,
        taskId,
        userId,
        startDate: '2026-03-01T10:00:00.000Z',
      });

      tasksOverridesWriteRepoMock.getOneRecurrence.mockResolvedValueOnce(recurrence);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(existingTask);
      tasksOverridesWriteRepoMock.upsertOverride.mockResolvedValueOnce({ id: 8001 } as never);

      const payload: GoalDeleteTask.Request = buildPayload({
        data: {
          taskId: virtualTaskId,
          userId,
        },
      });

      const res = await sendMessage<GoalDeleteTask.Response, GoalDeleteTask.Request>(GoalDeleteTask.pattern, payload);
      const expectedStart = timeAndDate(recurrenceStart).tz(recurrence.timezone, true).utc();
      const expectedDeadline = expectedStart.add(2, 'hour');

      expect(tasksOverridesWriteRepoMock.getOneRecurrence).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(tasksOverridesWriteRepoMock.upsertOverride).toHaveBeenCalledTimes(1);

      const [[overrideArg, overrideTrxArg]] = tasksOverridesWriteRepoMock.upsertOverride.mock.calls;
      expect(overrideArg.id).toBeNaN();
      expect(overrideArg.userId).toBe(userId);
      expect(overrideArg.groupId).toBeUndefined();
      expect(overrideArg.recurrenceId).toBe(recurrenceId);
      expect(overrideArg.recurrenceStart).toBe(recurrenceStart);
      expect(overrideArg.name).toBe('Virtual source');
      expect(overrideArg.description).toBeUndefined();
      expect(overrideArg.priority).toBe(2);
      expect(overrideArg.weight).toBe(1);
      expect(overrideArg.cancelReason).toBeUndefined();
      expect(overrideArg.startDate).toBe(expectedStart.toISOString());
      expect(overrideArg.deadline).toBe(expectedDeadline.toISOString());
      expect(overrideArg.endDate).toBeUndefined();
      expect(overrideArg.status).toBe(TaskStatus.DELETED);
      expect(overrideArg.type).toBe(TaskOverrideType.DELETED);
      expect(overrideTrxArg).toEqual(expectTransaction());
      expect(tasksWriteRepoMock.changeTaskStatus).not.toHaveBeenCalled();
      expect(res).toEqual({ data: { id: 8001 } });
    });

    test('should delete override task by updating override', async () => {
      const userId = 54;
      const taskId = 7101;
      const recurrenceId = 9101;
      const overrideId = 8101;
      const recurrenceStart = '2026-03-12T10:00:00.000Z';
      const overrideTaskId = TaskIdBuilder.wrapOverrideId({ recurrenceId, overrideId, date: recurrenceStart });

      const sourceTask = getTask({
        id: taskId,
        userId,
        name: 'Source task',
        description: 'source description',
        priority: 3,
        weight: 5,
        startDate: '2026-03-01T10:00:00.000Z',
        deadline: '2026-03-01T12:00:00.000Z',
        status: TaskStatus.IN_PROGRESS,
      });
      const recurrence = getTaskRecurrence({
        id: recurrenceId,
        taskId,
        userId,
        timezone: 'UTC',
        startDate: '2026-03-01T10:00:00.000Z',
      });
      const currentOverride = TaskOverride.restore({
        task: getTask({
          id: overrideId,
          userId,
          name: 'Override task',
          description: 'override description',
          priority: 4,
          weight: 9,
          startDate: '2026-03-12T09:30:00.000Z',
          deadline: '2026-03-12T13:45:00.000Z',
          status: TaskStatus.IN_PROGRESS,
        }),
        recurrenceId,
        recurrenceStart: DateVo.restore(recurrenceStart),
        type: TaskOverrideType.OVERRIDE,
      });

      tasksOverridesWriteRepoMock.getOneRecurrence.mockResolvedValueOnce(recurrence);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(sourceTask);
      tasksOverridesWriteRepoMock.getOneOverride.mockResolvedValueOnce(currentOverride);
      tasksOverridesWriteRepoMock.upsertOverride.mockResolvedValueOnce({ id: overrideId } as never);

      const payload: GoalDeleteTask.Request = buildPayload({
        data: {
          taskId: overrideTaskId,
          userId,
        },
      });

      const res = await sendMessage<GoalDeleteTask.Response, GoalDeleteTask.Request>(GoalDeleteTask.pattern, payload);

      expect(tasksOverridesWriteRepoMock.getOneRecurrence).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(tasksOverridesWriteRepoMock.getOneOverride).toHaveBeenCalledTimes(1);
      expect(tasksOverridesWriteRepoMock.upsertOverride).toHaveBeenCalledTimes(1);

      const [[overrideArg, overrideTrxArg]] = tasksOverridesWriteRepoMock.upsertOverride.mock.calls;
      expect(overrideArg).toBe(currentOverride);
      expect(overrideArg.id).toBe(overrideId);
      expect(overrideArg.userId).toBe(userId);
      expect(overrideArg.groupId).toBeUndefined();
      expect(overrideArg.recurrenceId).toBe(recurrenceId);
      expect(overrideArg.recurrenceStart).toBe(recurrenceStart);
      expect(overrideArg.name).toBe('Override task');
      expect(overrideArg.description).toBe('override description');
      expect(overrideArg.priority).toBe(4);
      expect(overrideArg.weight).toBe(9);
      expect(overrideArg.cancelReason).toBeUndefined();
      expect(overrideArg.startDate).toBe('2026-03-12T09:30:00.000Z');
      expect(overrideArg.deadline).toBe('2026-03-12T13:45:00.000Z');
      expect(overrideArg.endDate).toBeUndefined();
      expect(overrideArg.status).toBe(TaskStatus.DELETED);
      expect(overrideArg.type).toBe(TaskOverrideType.DELETED);
      expect(overrideTrxArg).toEqual(expectTransaction());
      expect(tasksWriteRepoMock.changeTaskStatus).not.toHaveBeenCalled();
      expect(res).toEqual({ data: { id: overrideId } });
    });
  });
});
