import { initTestEnvironment } from '@/../jest.setup';
import { Task } from '@/modules/tasks/domain';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalCreateTask, RmqErrorKind } from '@big-d/api-contracts';
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
import { getGroupWithTasks, getTask, getTaskView } from '@shared/__tests__/entities';
import {
  groupReadRepoMock,
  groupWriteRepoMock,
  inboxReadRepoMock,
  tasksReadRepoMock,
  tasksWriteRepoMock,
} from '@shared/__tests__/repository-mocks';

initTestEnvironment();
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

  describe(`${GoalCreateTask.pattern}`, () => {
    test('should create task without group', async () => {
      const userId = 10;
      const createdTask = getTask({ id: 44, userId, name: 'Task A', priority: 4, weight: 2 });
      const taskView = getTaskView({ id: createdTask.id, userId, name: createdTask.name });

      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(createdTask);
      tasksReadRepoMock.getById.mockResolvedValueOnce(taskView);

      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Task A',
          priority: 4,
          weight: 2,
        },
      });

      const res = await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
        GoalCreateTask.pattern,
        payload,
      );

      const [[createdTaskArg, trxArg]] = tasksWriteRepoMock.createTask.mock.calls;
      expect(createdTaskArg).toBeInstanceOf(Task);
      expect(createdTaskArg.id).toEqual(NaN);
      expect(createdTaskArg.userId).toBe(userId);
      expect(createdTaskArg.name).toBe('Task A');
      expect(createdTaskArg.priority).toBe(4);
      expect(createdTaskArg.weight).toBe(2);
      expect(trxArg).toEqual(expectTransaction());
      expect(groupWriteRepoMock.getGroupById).not.toHaveBeenCalled();
      expect(tasksWriteRepoMock.addTaskToGroup).not.toHaveBeenCalled();
      expect(tasksReadRepoMock.getById).toHaveBeenCalledWith(
        { id: createdTask.id, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId: createdTask.id, userId },
        expectTransaction(),
      );
      expect(res).toEqual({ data: toTaskResponse(taskView) });
    });

    test('should create task with group', async () => {
      const userId = 11;
      const groupId = 201;
      const createdTask = getTask({ id: 55, userId, name: 'Task B' });
      const taskView = getTaskView({ id: createdTask.id, userId, name: createdTask.name });

      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(createdTask);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(
        getGroupWithTasks({ id: groupId, user_id: userId }),
      );
      tasksWriteRepoMock.addTaskToGroup.mockResolvedValueOnce(undefined);
      tasksReadRepoMock.getById.mockResolvedValueOnce(taskView);

      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          groupId,
          name: 'Task B',
        },
      });

      const res = await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
        GoalCreateTask.pattern,
        payload,
      );

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledWith(
        { taskId: createdTask.id, groupId },
        expectTransaction(),
      );
      expect(tasksReadRepoMock.getById).toHaveBeenCalledWith(
        { id: createdTask.id, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith(
        { taskId: createdTask.id, userId },
        expectTransaction(),
      );
      expect(res).toEqual({ data: toTaskResponse(taskView) });
    });

    test('should throw when startDate in past', async () => {
      const userId = 14;
      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Past task',
          startDate: '2000-01-01T00:00:00.000Z',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(0);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'startDate' },
      });
    });

    test('should throw when deadline in past', async () => {
      const userId = 15;
      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Past deadline task',
          deadline: '2000-01-01T00:00:00.000Z',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(0);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'deadline' },
      });
    });

    test('should throw when startDate after deadline', async () => {
      const userId = 16;
      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Invalid date range',
          startDate: '2099-02-01T00:00:00.000Z',
          deadline: '2099-01-01T00:00:00.000Z',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(0);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskInvariantFailed.code,
        key: 'INVARIANT_FAILED',
        kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
        details: { field: 'startDate' },
      });
    });

    test('should throw when group missing', async () => {
      const userId = 12;
      const groupId = 300;
      const createdTask = getTask({ id: 60, userId, name: 'Task C' });
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(createdTask);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(null);

      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          groupId,
          name: 'Task C',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.addTaskToGroup).not.toHaveBeenCalled();
      expect(tasksReadRepoMock.getById).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.groupNotExist.code,
        key: 'GROUP_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { groupId },
      });
    });

    test('should throw when task view missing', async () => {
      const userId = 13;
      const createdTask = getTask({ id: 70, userId, name: 'Task D' });
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(createdTask);
      tasksReadRepoMock.getById.mockResolvedValueOnce(null);

      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Task D',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
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
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotFound.code,
        key: 'TASK_NOT_FOUNT',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId: createdTask.id },
      });
    });

    test('should throw when task creation read-after-write failed', async () => {
      const userId = 17;
      const createdTask = getTask({ id: 71, userId, name: 'Task E' });
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalCreateTask.Request = buildPayload({
        data: {
          userId,
          name: 'Task E',
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCreateTask.Response, GoalCreateTask.Request>(
          GoalCreateTask.pattern,
          payload,
        );
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(1);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledTimes(0);
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledTimes(0);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskCreationFailed.code,
        key: 'TASK_CREATION_FAILED',
        kind: RmqErrorKind.INTERNAL,
        details: { taskId: createdTask.id },
      });
    });
  });
});
