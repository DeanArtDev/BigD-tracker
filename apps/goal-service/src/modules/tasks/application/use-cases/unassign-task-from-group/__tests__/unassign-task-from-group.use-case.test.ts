import { TaskIdBuilder } from '@/modules/tasks/domain';
import { getTask, getTaskRecurrence } from '@shared/__tests__/entities';
import { UnassignTaskFromGroupCommand } from '../unassign-task-from-group.command';
import { UnassignTaskFromGroupUseCase } from '../unassign-task-from-group.use-case';

describe('UnassignTaskFromGroupUseCase', () => {
  const trx = { id: 333, trueTransaction: true };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('unassigns origin task from group', async () => {
    const userId = 77;
    const taskId = 7001;
    const groupId = 9001;
    const recurrenceId = 8001;
    const task = getTask({ id: taskId, userId, groupId, recurrenceId });

    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(task),
    };
    const groupCheckerService = {
      ensureTaskInGroup: jest.fn(),
    };
    const taskTypeService = {
      getType: jest.fn().mockReturnValue({
        isOrigin: true,
        isVirtual: false,
        isOverride: false,
        data: { id: taskId },
      }),
    };
    const taskOverrideService = {
      updateGroupIdForManyOverrides: jest.fn(),
    };
    const tasksWriteRepo = {
      replaceTask: jest.fn().mockImplementation((taskToSave) => taskToSave),
    };
    const db = {
      runTransaction: jest.fn().mockImplementation(async (work) => await work(trx)),
    };

    const useCase = new UnassignTaskFromGroupUseCase(
      taskCheckerService as never,
      groupCheckerService as never,
      taskTypeService,
      taskOverrideService as never,
      tasksWriteRepo as never,
      db as never,
    );

    const result = await useCase.execute(
      new UnassignTaskFromGroupCommand({
        userId,
        taskId: TaskIdBuilder.wrapOriginId(taskId),
        groupId,
      }),
    );

    expect(result).toMatchObject({
      id: TaskIdBuilder.wrapOriginId(taskId),
      groupId: undefined,
    });
    expect(taskCheckerService.ensureTaskExists).toHaveBeenCalledWith({ taskId, userId }, { trx });
    expect(groupCheckerService.ensureTaskInGroup).toHaveBeenCalledWith({ groupId, userId, taskId }, { trx });
    expect(tasksWriteRepo.replaceTask).toHaveBeenCalledTimes(1);

    const [taskArg, replaceTrxArg] = tasksWriteRepo.replaceTask.mock.calls[0];
    expect(taskArg.id).toBe(taskId);
    expect(taskArg.groupId).toBeUndefined();
    expect(replaceTrxArg).toBe(trx);

    expect(taskOverrideService.updateGroupIdForManyOverrides).toHaveBeenCalledWith(
      { userId, groupId: undefined, recurrenceId },
      trx,
    );
  });

  test('unassigns virtual task series from group', async () => {
    const userId = 78;
    const taskId = 7002;
    const groupId = 9002;
    const recurrenceId = 8002;
    const recurrenceStart = '2026-03-12T10:00:00.000Z';
    const recurrence = getTaskRecurrence({ id: recurrenceId, userId, taskId });
    const sourceTask = getTask({ id: taskId, userId, groupId, recurrenceId });

    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
      ensureRecurrenceExists: jest.fn().mockResolvedValue(recurrence),
    };
    const groupCheckerService = {
      ensureTaskInGroup: jest.fn(),
    };
    const taskTypeService = {
      getType: jest.fn().mockReturnValue({
        isOrigin: false,
        isVirtual: true,
        isOverride: false,
        data: { recurrenceId, date: recurrenceStart },
      }),
    };
    const taskOverrideService = {
      updateGroupIdForManyOverrides: jest.fn(),
    };
    const tasksWriteRepo = {
      replaceTask: jest.fn().mockImplementation((taskToSave) => taskToSave),
    };
    const db = {
      runTransaction: jest.fn().mockImplementation(async (work) => await work(trx)),
    };

    const useCase = new UnassignTaskFromGroupUseCase(
      taskCheckerService as never,
      groupCheckerService as never,
      taskTypeService,
      taskOverrideService as never,
      tasksWriteRepo as never,
      db as never,
    );

    const result = await useCase.execute(
      new UnassignTaskFromGroupCommand({
        userId,
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId, date: recurrenceStart }),
        groupId,
      }),
    );

    expect(result).toMatchObject({
      id: TaskIdBuilder.wrapOriginId(taskId),
      groupId: undefined,
    });
    expect(taskCheckerService.ensureRecurrenceExists).toHaveBeenCalledWith({ id: recurrenceId, userId }, { trx });
    expect(taskCheckerService.ensureTaskExists).toHaveBeenCalledWith({ taskId, userId }, { trx });
    expect(groupCheckerService.ensureTaskInGroup).toHaveBeenCalledWith({ groupId, userId, taskId }, { trx });
    expect(tasksWriteRepo.replaceTask).toHaveBeenCalledTimes(1);

    const [taskArg, replaceTrxArg] = tasksWriteRepo.replaceTask.mock.calls[0];
    expect(taskArg.id).toBe(taskId);
    expect(taskArg.groupId).toBeUndefined();
    expect(replaceTrxArg).toBe(trx);

    expect(taskOverrideService.updateGroupIdForManyOverrides).toHaveBeenCalledWith(
      { userId, groupId: undefined, recurrenceId },
      trx,
    );
  });

  test('unassigns override task series from group', async () => {
    const userId = 79;
    const taskId = 7003;
    const groupId = 9003;
    const recurrenceId = 8003;
    const overrideId = 9103;
    const recurrenceStart = '2026-03-13T10:00:00.000Z';
    const recurrence = getTaskRecurrence({ id: recurrenceId, userId, taskId });
    const sourceTask = getTask({ id: taskId, userId, groupId, recurrenceId });

    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
      ensureRecurrenceExists: jest.fn().mockResolvedValue(recurrence),
    };
    const groupCheckerService = {
      ensureTaskInGroup: jest.fn(),
    };
    const taskTypeService = {
      getType: jest.fn().mockReturnValue({
        isOrigin: false,
        isVirtual: false,
        isOverride: true,
        data: { recurrenceId, overrideId, date: recurrenceStart },
      }),
    };
    const taskOverrideService = {
      updateGroupIdForManyOverrides: jest.fn(),
    };
    const tasksWriteRepo = {
      replaceTask: jest.fn().mockImplementation((taskToSave) => taskToSave),
    };
    const db = {
      runTransaction: jest.fn().mockImplementation(async (work) => await work(trx)),
    };

    const useCase = new UnassignTaskFromGroupUseCase(
      taskCheckerService as never,
      groupCheckerService as never,
      taskTypeService,
      taskOverrideService as never,
      tasksWriteRepo as never,
      db as never,
    );

    const result = await useCase.execute(
      new UnassignTaskFromGroupCommand({
        userId,
        taskId: TaskIdBuilder.wrapOverrideId({ recurrenceId, overrideId, date: recurrenceStart }),
        groupId,
      }),
    );

    expect(result).toMatchObject({
      id: TaskIdBuilder.wrapOriginId(taskId),
      groupId: undefined,
    });
    expect(taskCheckerService.ensureRecurrenceExists).toHaveBeenCalledWith({ id: recurrenceId, userId }, { trx });
    expect(taskCheckerService.ensureTaskExists).toHaveBeenCalledWith({ taskId, userId }, { trx });
    expect(groupCheckerService.ensureTaskInGroup).toHaveBeenCalledWith({ groupId, userId, taskId }, { trx });
    expect(tasksWriteRepo.replaceTask).toHaveBeenCalledTimes(1);

    const [taskArg, replaceTrxArg] = tasksWriteRepo.replaceTask.mock.calls[0];
    expect(taskArg.id).toBe(taskId);
    expect(taskArg.groupId).toBeUndefined();
    expect(replaceTrxArg).toBe(trx);

    expect(taskOverrideService.updateGroupIdForManyOverrides).toHaveBeenCalledWith(
      { userId, groupId: undefined, recurrenceId },
      trx,
    );
  });
});
