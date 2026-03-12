import { TaskIdBuilder } from '@/modules/tasks/domain';
import { FinishTaskCommand } from '../finish-task.command';
import { FinishTaskUseCase } from '../finish-task.use-case';
import { TaskOverride } from '@/modules/tasks/domain';
import { TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { timeAndDate } from '@shared/date-and-time';
import { getTask, getTaskRecurrence } from '@shared/__tests__/entities';

describe('FinishTaskUseCase', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('creates overdue override for virtual task finish when deadline is after finish date', async () => {
    const userId = 77;
    const taskId = 7001;
    const recurrenceId = 8001;
    const recurrenceStart = '2026-03-12T10:00:00.000Z';
    const recurrence = getTaskRecurrence({
      id: recurrenceId,
      userId,
      taskId,
      startDate: '2026-03-01T10:00:00.000Z',
    });
    const sourceTask = getTask({
      id: taskId,
      userId,
      recurrenceId,
      name: 'Virtual source',
      description: 'virtual source description',
      priority: 3,
      weight: 5,
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-02T12:00:00.000Z',
      status: TaskStatus.IN_PROGRESS,
    });
    const expectedStart = timeAndDate(recurrenceStart).tz(recurrence.timezone, true).utc();
    const expectedDeadline = expectedStart.add(26, 'hour');
    const finishedAt = expectedStart.add(1, 'hour').toDate();
    const trx = { id: 333, trueTransaction: true };

    jest.useFakeTimers().setSystemTime(finishedAt);

    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const inboxGroupCheckerService = {
      ensureTaskInInboxGroup: jest.fn(),
    };
    const taskTypeService = {
      getType: jest.fn().mockReturnValue({
        isOrigin: false,
        isVirtual: true,
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
      removeTaskFromGroup: jest.fn(),
    };
    const useCase = new FinishTaskUseCase(
      taskCheckerService as never,
      inboxGroupCheckerService as never,
      taskTypeService as never,
      taskRecurrenceService as never,
      taskOverrideService as never,
      db as never,
      tasksWriteRepo as never,
    );

    await useCase.execute(
      new FinishTaskCommand({
        userId,
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId, date: recurrenceStart }),
      }),
    );

    expect(db.runTransaction).toHaveBeenCalledTimes(1);
    expect(taskTypeService.getType).toHaveBeenCalledWith({
      taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId, date: recurrenceStart }),
    });
    expect(taskRecurrenceService.getRecurrence).toHaveBeenCalledWith({ userId, id: recurrenceId }, trx);
    expect(taskCheckerService.ensureTaskExists).toHaveBeenCalledWith({ userId, taskId }, { trx });
    expect(taskOverrideService.upsertOverride).toHaveBeenCalledTimes(1);

    const [overrideArg, overrideTrxArg] = taskOverrideService.upsertOverride.mock.calls[0];
    expect(overrideArg.id).toBeNaN();
    expect(overrideArg.userId).toBe(userId);
    expect(overrideArg.recurrenceId).toBe(recurrenceId);
    expect(overrideArg.recurrenceStart).toBe(recurrenceStart);
    expect(overrideArg.name).toBe('Virtual source');
    expect(overrideArg.description).toBe('virtual source description');
    expect(overrideArg.priority).toBe(3);
    expect(overrideArg.weight).toBe(5);
    expect(overrideArg.startDate).toBe(expectedStart.toISOString());
    expect(overrideArg.deadline).toBe(expectedDeadline.toISOString());
    expect(overrideArg.endDate).toBe(expectedStart.add(1, 'hour').toISOString());
    expect(overrideArg.status).toBe(TaskStatus.OVERDUE);
    expect(overrideArg.type).toBe(TaskOverrideType.OVERRIDE);
    expect(overrideTrxArg).toBe(trx);
    expect(tasksWriteRepo.replaceTask).not.toHaveBeenCalled();
    expect(tasksWriteRepo.removeTaskFromGroup).not.toHaveBeenCalled();
    expect(inboxGroupCheckerService.ensureTaskInInboxGroup).not.toHaveBeenCalled();
  });

  test('updates override for override task finish', async () => {
    const userId = 78;
    const taskId = 7002;
    const recurrenceId = 8002;
    const overrideId = 9002;
    const recurrenceStart = '2026-03-12T10:00:00.000Z';
    const recurrence = getTaskRecurrence({
      id: recurrenceId,
      userId,
      taskId,
      startDate: '2026-03-01T10:00:00.000Z',
    });
    const sourceTask = getTask({
      id: taskId,
      userId,
      recurrenceId,
      name: 'Source task',
      description: 'source task description',
      priority: 3,
      weight: 5,
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-02T12:00:00.000Z',
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
        startDate: '2026-03-12T09:30:00.000Z',
        deadline: '2026-03-13T13:45:00.000Z',
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
    const inboxGroupCheckerService = {
      ensureTaskInInboxGroup: jest.fn(),
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
      removeTaskFromGroup: jest.fn(),
    };
    const useCase = new FinishTaskUseCase(
      taskCheckerService as never,
      inboxGroupCheckerService as never,
      taskTypeService as never,
      taskRecurrenceService as never,
      taskOverrideService as never,
      db as never,
      tasksWriteRepo as never,
    );

    await useCase.execute(
      new FinishTaskCommand({
        userId,
        taskId: TaskIdBuilder.wrapOverrideId({ recurrenceId, overrideId, date: recurrenceStart }),
      }),
    );

    expect(db.runTransaction).toHaveBeenCalledTimes(1);
    expect(taskTypeService.getType).toHaveBeenCalledWith({
      taskId: TaskIdBuilder.wrapOverrideId({ recurrenceId, overrideId, date: recurrenceStart }),
    });
    expect(taskRecurrenceService.getRecurrence).toHaveBeenCalledWith({ userId, id: recurrenceId }, trx);
    expect(taskCheckerService.ensureTaskExists).toHaveBeenCalledWith({ userId, taskId }, { trx });
    expect(taskOverrideService.getOverride).toHaveBeenCalledWith({ userId, id: overrideId }, trx);
    expect(taskOverrideService.upsertOverride).toHaveBeenCalledTimes(1);

    const [overrideArg, overrideTrxArg] = taskOverrideService.upsertOverride.mock.calls[0];
    expect(overrideArg).toBe(currentOverride);
    expect(overrideArg.id).toBe(overrideId);
    expect(overrideArg.userId).toBe(userId);
    expect(overrideArg.recurrenceId).toBe(recurrenceId);
    expect(overrideArg.recurrenceStart).toBe(recurrenceStart);
    expect(overrideArg.name).toBe('Override task');
    expect(overrideArg.description).toBe('override description');
    expect(overrideArg.priority).toBe(4);
    expect(overrideArg.weight).toBe(6);
    expect(overrideArg.startDate).toBe('2026-03-12T09:30:00.000Z');
    expect(overrideArg.deadline).toBe('2026-03-13T13:45:00.000Z');
    expect(overrideArg.endDate).toBe('2026-03-12T12:00:00.000Z');
    expect(overrideArg.status).toBe(TaskStatus.OVERDUE);
    expect(overrideArg.type).toBe(TaskOverrideType.OVERRIDE);
    expect(overrideTrxArg).toBe(trx);
    expect(tasksWriteRepo.replaceTask).not.toHaveBeenCalled();
    expect(tasksWriteRepo.removeTaskFromGroup).not.toHaveBeenCalled();
    expect(inboxGroupCheckerService.ensureTaskInInboxGroup).not.toHaveBeenCalled();
  });
});
