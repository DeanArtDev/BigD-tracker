import { initTestEnvironment } from '@/../jest.setup';
import { Task, TaskIdBuilder } from '@/modules/tasks/domain';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { GoalCloneTask, RmqErrorKind } from '@big-d/api-contracts';
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
} from '@shared/__tests__';

initTestEnvironment();
const toTaskResponse = (taskView: ReturnType<typeof getTaskView>) => ({
  id: taskView.id,
  userId: taskView.userId,
  name: taskView.name,
  description: taskView.description,
  priority: taskView.priority,
  weight: taskView.weight,
  cancelReason: taskView.cancelReason,
  endDate: taskView.endDate,
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

  describe(`${GoalCloneTask.pattern}`, () => {
    test('should clone task without group', async () => {
      const userId = 21;
      const taskId = 2001;
      const originalTask = getTask({ id: taskId, userId, name: 'Original' });
      const clonedTask = getTask({ id: originalTask.id + 1, userId, name: originalTask.name });
      const taskView = getTaskView({ id: clonedTask.id, userId, name: clonedTask.name });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(originalTask);
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(clonedTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(clonedTask);
      tasksReadRepoMock.getById.mockResolvedValueOnce(taskView);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId: TaskIdBuilder.wrapOriginId(taskId),
        },
      });

      const res = await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(GoalCloneTask.pattern, payload);

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      const [[clonedTaskArg, trxArg]] = tasksWriteRepoMock.createTask.mock.calls;
      expect(clonedTaskArg).toBeInstanceOf(Task);
      expect(clonedTaskArg.id).toEqual(NaN);
      expect(clonedTaskArg.name).toBe('Original');
      expect(trxArg).toEqual(expectTransaction());
      expect(tasksReadRepoMock.getById).toHaveBeenCalledWith({ id: clonedTask.id, userId }, expectTransaction());
      expect(res).toEqual({
        data: toTaskResponse(taskView),
      });
    });

    test('should clone task with group', async () => {
      const userId = 22;
      const taskId = 3001;
      const groupId = 401;

      const originalTask = getTask({ id: taskId, userId, name: 'Original' });
      const clonedTask = getTask({ ...originalTask, id: originalTask.id + 1 });
      const taskView = getTaskView({ id: clonedTask.id, userId, name: clonedTask.name });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(originalTask);
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(clonedTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(clonedTask);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(getGroupWithTasks({ id: groupId, user_id: userId }));
      tasksWriteRepoMock.addTaskToGroup.mockResolvedValueOnce(undefined);
      tasksReadRepoMock.getById.mockResolvedValueOnce(taskView);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId: TaskIdBuilder.wrapOriginId(taskId),
          groupId,
        },
      });

      const res = await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(GoalCloneTask.pattern, payload);

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId, includeInbox: true },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.addTaskToGroup).toHaveBeenCalledWith(
        { taskId: clonedTask.id, groupId },
        expectTransaction(),
      );
      expect(res).toEqual({ data: toTaskResponse(taskView) });
    });

    test('should throw when task missing', async () => {
      const userId = 23;
      const taskId = 3003;
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId: TaskIdBuilder.wrapOriginId(taskId),
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(GoalCloneTask.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledWith({ taskId, userId }, expectTransaction());
      expect(tasksWriteRepoMock.createTask).not.toHaveBeenCalled();
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotExist.code,
        key: 'TASK_NOT_EXIST',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId },
      });
    });

    test('should throw when group missing', async () => {
      const userId = 24;
      const taskId = 3004;
      const groupId = 402;
      const originalTask = getTask({ id: taskId, userId, name: 'Original' });
      const clonedTask = getTask({ id: 3005, userId, name: 'Original' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(originalTask);
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(clonedTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(clonedTask);
      groupWriteRepoMock.getGroupById.mockResolvedValueOnce(null);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId: TaskIdBuilder.wrapOriginId(taskId),
          groupId,
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(GoalCloneTask.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(groupWriteRepoMock.getGroupById).toHaveBeenCalledWith(
        { groupId, userId, includeInbox: true },
        expectTransaction(),
      );
      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
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
      const userId = 25;
      const taskId = 3006;
      const originalTask = getTask({ id: taskId, userId, name: 'Original' });
      const clonedTask = getTask({ id: 3007, userId, name: 'Original' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(originalTask);
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(clonedTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(clonedTask);
      tasksReadRepoMock.getById.mockResolvedValueOnce(null);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId: TaskIdBuilder.wrapOriginId(taskId),
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(GoalCloneTask.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(tasksReadRepoMock.getById).toHaveBeenCalledWith({ id: clonedTask.id, userId }, expectTransaction());
      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(2);
      expect(unwrapRpcError(error)).toMatchObject({
        code: exceptionCode.taskNotFound.code,
        key: 'TASK_NOT_FOUNT',
        kind: RmqErrorKind.NOT_FOUND,
        details: { taskId: clonedTask.id },
      });
    });

    test('should throw when cloned task missing after write', async () => {
      const userId = 26;
      const taskId = 3008;
      const originalTask = getTask({ id: taskId, userId, name: 'Original' });
      const createdTask = getTask({ id: 3009, userId, name: 'Original' });

      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(originalTask);
      tasksWriteRepoMock.createTask.mockResolvedValueOnce(createdTask);
      tasksWriteRepoMock.getTaskById.mockResolvedValueOnce(null);

      const payload: GoalCloneTask.Request = buildPayload({
        data: {
          userId,
          taskId: TaskIdBuilder.wrapOriginId(taskId),
        },
      });

      let error: unknown;
      try {
        await sendMessage<GoalCloneTask.Response, GoalCloneTask.Request>(GoalCloneTask.pattern, payload);
      } catch (err) {
        error = err;
      }

      expect(tasksWriteRepoMock.getTaskById).toHaveBeenCalledTimes(2);
      expect(tasksWriteRepoMock.createTask).toHaveBeenCalledTimes(1);
      expect(tasksReadRepoMock.getById).toHaveBeenCalledTimes(0);
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
