import { TaskIdBuilder, TaskOverride } from '@/modules/tasks/domain';
import { TaskFinishStatus, TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { getTask, getTaskRecurrence } from '@shared/__tests__/entities';
import { FinishTaskCommand } from '../finish-task.command';
import { FinishTaskUseCase } from '../finish-task.use-case';

function createUseCase(deps: {
  taskCheckerService?: { ensureTaskExists: jest.Mock };
  taskTypeService?: { getType: jest.Mock };
  taskRecurrenceService?: { getRecurrence: jest.Mock };
  taskOverrideService?: { getOverride?: jest.Mock; upsertOverride: jest.Mock };
  db?: { runTransaction: jest.Mock };
  tasksWriteRepo?: { replaceTask: jest.Mock };
}) {
  return new FinishTaskUseCase(
    (deps.taskCheckerService ?? { ensureTaskExists: jest.fn() }) as never,
    (deps.taskTypeService ?? { getType: jest.fn() }) as never,
    (deps.taskRecurrenceService ?? { getRecurrence: jest.fn() }) as never,
    (deps.taskOverrideService ?? { upsertOverride: jest.fn() }) as never,
    (deps.db ??
      ({
        runTransaction: jest.fn().mockImplementation(async (work) => await work({ id: 333, trueTransaction: true })),
      } as const)) as never,
    (deps.tasksWriteRepo ?? { replaceTask: jest.fn() }) as never,
  );
}

describe('FinishTaskUseCase', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test.each([
    { type: TaskFinishStatus.COMPLETED, expectedStatus: TaskStatus.COMPLETED, reason: undefined },
    { type: TaskFinishStatus.OVERDUE, expectedStatus: TaskStatus.OVERDUE, reason: undefined },
    { type: TaskFinishStatus.CANCELED, expectedStatus: TaskStatus.CANCELED, reason: 'User canceled task' },
  ])('finishes origin task with $type status', async ({ type, expectedStatus, reason }) => {
    const userId = 76;
    const taskId = 7000;
    const task = getTask({
      id: taskId,
      userId,
      name: 'Origin task',
      description: 'origin description',
      priority: 3,
      weight: 5,
      startDate: '2026-03-12T09:00',
      deadline: '2026-03-12T18:00',
      status: TaskStatus.IN_PROGRESS,
    });
    const finishedAt = new Date('2026-03-12T12:00:00.000Z');
    const trx = { id: 333, trueTransaction: true };

    jest.useFakeTimers().setSystemTime(finishedAt);

    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(task),
    };
    const taskTypeService = {
      getType: jest.fn().mockReturnValue({
        isOrigin: true,
        isVirtual: false,
        isOverride: false,
        data: { id: taskId },
      }),
    };
    const taskRecurrenceService = {
      getRecurrence: jest.fn(),
    };
    const taskOverrideService = {
      upsertOverride: jest.fn(),
    };
    const db = {
      runTransaction: jest.fn().mockImplementation(async (work) => await work(trx)),
    };
    const tasksWriteRepo = {
      replaceTask: jest.fn(),
    };
    const useCase = createUseCase({
      taskCheckerService,
      taskTypeService,
      taskRecurrenceService,
      taskOverrideService,
      db,
      tasksWriteRepo,
    });

    await useCase.execute(
      new FinishTaskCommand({
        userId,
        taskId: `t::${taskId}`,
        type,
        reason,
      }),
    );

    expect(tasksWriteRepo.replaceTask).toHaveBeenCalledTimes(1);
    const [taskArg, trxArg] = tasksWriteRepo.replaceTask.mock.calls[0];
    expect(taskArg.id).toBe(taskId);
    expect(taskArg.status).toBe(expectedStatus);
    expect(taskArg.endDate).toBe(DateVo.format(finishedAt.toISOString()));
    expect(taskArg.cancelReason).toBe(reason);
    expect(trxArg).toBe(trx);
    expect(taskOverrideService.upsertOverride).not.toHaveBeenCalled();
  });

  test.each([
    {
      type: TaskFinishStatus.COMPLETED,
      expectedStatus: TaskStatus.COMPLETED,
      expectedOverrideType: TaskOverrideType.OVERRIDE,
      reason: undefined,
    },
    {
      type: TaskFinishStatus.OVERDUE,
      expectedStatus: TaskStatus.OVERDUE,
      expectedOverrideType: TaskOverrideType.OVERRIDE,
      reason: undefined,
    },
    {
      type: TaskFinishStatus.CANCELED,
      expectedStatus: TaskStatus.CANCELED,
      expectedOverrideType: TaskOverrideType.CANCELED,
      reason: 'User canceled virtual task',
    },
  ])('creates virtual override with $type status', async ({ type, expectedStatus, expectedOverrideType, reason }) => {
    const userId = 77;
    const taskId = 7001;
    const recurrenceId = 8001;
    const recurrenceStart = '2026-03-12T10:00';
    const recurrence = getTaskRecurrence({
      id: recurrenceId,
      userId,
      taskId,
      startDate: '2026-03-01T10:00',
    });
    const sourceTask = getTask({
      id: taskId,
      userId,
      recurrenceId,
      name: 'Virtual source',
      description: 'virtual source description',
      priority: 3,
      weight: 5,
      startDate: '2026-03-01T10:00',
      deadline: '2026-03-02T12:00',
      status: TaskStatus.IN_PROGRESS,
    });
    const finishedAt = new Date('2026-03-12T12:00:00.000Z');
    const trx = { id: 333, trueTransaction: true };

    jest.useFakeTimers().setSystemTime(finishedAt);

    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const taskTypeService = {
      getType: jest.fn().mockReturnValue({
        isOrigin: false,
        isVirtual: true,
        isOverride: false,
        data: { recurrenceId, date: recurrenceStart },
      }),
    };
    const taskRecurrenceService = {
      getRecurrence: jest.fn().mockResolvedValue(recurrence),
    };
    const taskOverrideService = {
      upsertOverride: jest.fn().mockResolvedValue({ id: 9001 }),
    };
    const db = {
      runTransaction: jest.fn().mockImplementation(async (work) => await work(trx)),
    };
    const tasksWriteRepo = {
      replaceTask: jest.fn(),
    };
    const useCase = createUseCase({
      taskCheckerService,
      taskTypeService,
      taskRecurrenceService,
      taskOverrideService,
      db,
      tasksWriteRepo,
    });

    await useCase.execute(
      new FinishTaskCommand({
        userId,
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId, date: recurrenceStart }),
        type,
        reason,
      }),
    );

    expect(taskOverrideService.upsertOverride).toHaveBeenCalledTimes(1);
    const [overrideArg, trxArg] = taskOverrideService.upsertOverride.mock.calls[0];
    expect(overrideArg.recurrenceId).toBe(recurrenceId);
    expect(overrideArg.recurrenceStart).toBe(DateVo.format(recurrenceStart));
    expect(overrideArg.status).toBe(expectedStatus);
    expect(overrideArg.type).toBe(expectedOverrideType);
    expect(overrideArg.cancelReason).toBe(reason);
    expect(overrideArg.endDate).toBe(DateVo.format(finishedAt.toISOString()));
    expect(trxArg).toBe(trx);
    expect(tasksWriteRepo.replaceTask).not.toHaveBeenCalled();
  });

  test.each([
    {
      type: TaskFinishStatus.COMPLETED,
      expectedStatus: TaskStatus.COMPLETED,
      expectedOverrideType: TaskOverrideType.OVERRIDE,
      reason: undefined,
    },
    {
      type: TaskFinishStatus.OVERDUE,
      expectedStatus: TaskStatus.OVERDUE,
      expectedOverrideType: TaskOverrideType.OVERRIDE,
      reason: undefined,
    },
    {
      type: TaskFinishStatus.CANCELED,
      expectedStatus: TaskStatus.CANCELED,
      expectedOverrideType: TaskOverrideType.OVERRIDE,
      reason: 'User canceled override task',
    },
  ])('updates override task with $type status', async ({ type, expectedStatus, expectedOverrideType, reason }) => {
    const userId = 78;
    const taskId = 7002;
    const recurrenceId = 8002;
    const overrideId = 9002;
    const recurrenceStart = '2026-03-12T10:00';
    const recurrence = getTaskRecurrence({
      id: recurrenceId,
      userId,
      taskId,
      startDate: recurrenceStart,
    });
    const sourceTask = getTask({
      id: taskId,
      userId,
      recurrenceId,
      name: 'Source task',
      description: 'source task description',
      priority: 3,
      weight: 5,
      startDate: '2026-03-01T10:00',
      deadline: '2026-03-02T12:00',
      status: TaskStatus.IN_PROGRESS,
    });
    const currentOverride = TaskOverride.restore({
      task: getTask({
        id: overrideId,
        userId,
        name: 'Override task',
        description: 'override description',
        priority: 4,
        weight: 6,
        startDate: '2026-03-12T09:30',
        deadline: '2026-03-13T13:45',
        status: TaskStatus.IN_PROGRESS,
      }),
      recurrenceId,
      recurrenceStart: DateVo.restore(recurrenceStart),
      type: TaskOverrideType.OVERRIDE,
    });
    const finishedAt = new Date('2026-03-12T12:00:00.000Z');
    const trx = { id: 333, trueTransaction: true };

    jest.useFakeTimers().setSystemTime(finishedAt);

    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const taskTypeService = {
      getType: jest.fn().mockReturnValue({
        isOrigin: false,
        isVirtual: false,
        isOverride: true,
        data: { recurrenceId, overrideId, date: recurrenceStart },
      }),
    };
    const taskRecurrenceService = {
      getRecurrence: jest.fn().mockResolvedValue(recurrence),
    };
    const taskOverrideService = {
      getOverride: jest.fn().mockResolvedValue(currentOverride),
      upsertOverride: jest.fn().mockResolvedValue({ id: overrideId }),
    };
    const db = {
      runTransaction: jest.fn().mockImplementation(async (work) => await work(trx)),
    };
    const tasksWriteRepo = {
      replaceTask: jest.fn(),
    };
    const useCase = createUseCase({
      taskCheckerService,
      taskTypeService,
      taskRecurrenceService,
      taskOverrideService,
      db,
      tasksWriteRepo,
    });

    await useCase.execute(
      new FinishTaskCommand({
        userId,
        taskId: TaskIdBuilder.wrapOverrideId({ recurrenceId, overrideId, date: recurrenceStart }),
        type,
        reason,
      }),
    );

    expect(taskOverrideService.upsertOverride).toHaveBeenCalledTimes(1);
    const [overrideArg, trxArg] = taskOverrideService.upsertOverride.mock.calls[0];
    expect(overrideArg).toBe(currentOverride);
    expect(overrideArg.id).toBe(overrideId);
    expect(overrideArg.recurrenceId).toBe(recurrenceId);
    expect(overrideArg.recurrenceStart).toBe(DateVo.format(recurrenceStart));
    expect(overrideArg.status).toBe(expectedStatus);
    expect(overrideArg.type).toBe(expectedOverrideType);
    expect(overrideArg.cancelReason).toBe(reason);
    expect(overrideArg.endDate).toBe(DateVo.format(finishedAt.toISOString()));
    expect(trxArg).toBe(trx);
    expect(tasksWriteRepo.replaceTask).not.toHaveBeenCalled();
  });
});
