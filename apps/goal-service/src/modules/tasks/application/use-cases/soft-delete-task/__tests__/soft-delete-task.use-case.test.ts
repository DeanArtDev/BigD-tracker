import { Priority, Task, TaskIdBuilder, TaskOverride } from '@/modules/tasks/domain';
import { TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { getTask, getTaskRecurrence } from '@shared/__tests__/entities';
import { SoftDeleteTaskCommand } from '../soft-delete-task.command';
import { SoftDeleteTaskUseCase } from '../soft-delete-task.use-case';

function createUseCase(deps: {
  taskServices?: { softDeleteTask: jest.Mock };
  taskCheckerService?: { ensureTaskExists: jest.Mock };
  taskTypeService?: { getType: jest.Mock };
  taskRecurrenceService?: { getRecurrence: jest.Mock; deleteRecurrence?: jest.Mock };
  taskOverrideService?: {
    getOverride?: jest.Mock;
    getOverridesByRecurrenceId?: jest.Mock;
    upsertOverride: jest.Mock;
  };
  db?: { runTransaction: jest.Mock };
}) {
  return new SoftDeleteTaskUseCase(
    (deps.taskServices ?? { softDeleteTask: jest.fn() }) as never,
    (deps.taskCheckerService ?? { ensureTaskExists: jest.fn() }) as never,
    deps.taskTypeService ?? { getType: jest.fn() },
    (deps.taskRecurrenceService ?? { getRecurrence: jest.fn() }) as never,
    (deps.taskOverrideService ?? { upsertOverride: jest.fn() }) as never,
    (deps.db ?? {
      runTransaction: jest.fn().mockImplementation(async (work) => await work({ id: 333 })),
    }) as never,
  );
}

function restoreSavedOverride(override: TaskOverride, id: number): TaskOverride {
  return TaskOverride.restore({
    recurrenceId: override.recurrenceId,
    recurrenceStart: DateVo.restore(override.recurrenceStart),
    type: override.type,
    task: Task.restore({
      id,
      userId: override.userId,
      groupId: override.groupId,
      name: Name.restore(override.name),
      description: override.description,
      priority: Priority.restore(override.priority),
      cancelReason: override.cancelReason,
      startDate: override.startDate != null ? DateVo.restore(override.startDate) : undefined,
      deadline: override.deadline != null ? DateVo.restore(override.deadline) : undefined,
      endDate: override.endDate != null ? DateVo.restore(override.endDate) : undefined,
      status: override.status,
    }),
  });
}

describe('SoftDeleteTaskUseCase', () => {
  test('returns deleted origin task', async () => {
    const userId = 77;
    const taskId = 7001;
    const deletedTask = getTask({
      id: taskId,
      userId,
      groupId: 901,
      name: 'Origin task',
      description: 'Description',
      priority: 3,
      startDate: '2026-08-10T10:00',
      deadline: '2026-08-10T12:00',
      status: TaskStatus.DELETED,
    });
    const trx = { id: 333 };
    const taskServices = {
      softDeleteTask: jest.fn().mockResolvedValue(deletedTask),
    };
    const taskTypeService = {
      getType: jest.fn().mockReturnValue({
        isOrigin: true,
        isVirtual: false,
        isOverride: false,
        data: { id: taskId },
      }),
    };
    const db = {
      runTransaction: jest.fn().mockImplementation(async (work) => await work(trx)),
    };
    const useCase = createUseCase({ taskServices, taskTypeService, db });

    const result = await useCase.execute(
      new SoftDeleteTaskCommand({
        userId,
        taskId: TaskIdBuilder.wrapOriginId(taskId),
      }),
    );

    expect(taskServices.softDeleteTask).toHaveBeenCalledWith({ taskId, userId }, trx);
    expect(result).toMatchObject({
      id: TaskIdBuilder.wrapOriginId(taskId),
      userId,
      groupId: 901,
      name: 'Origin task',
      description: 'Description',
      priority: 3,
      startDate: '2026-08-10T10:00',
      deadline: '2026-08-10T12:00',
      status: TaskStatus.DELETED,
    });
  });

  test('returns deleted virtual task as a saved override', async () => {
    const userId = 77;
    const taskId = 7001;
    const recurrenceId = 8001;
    const overrideId = 9001;
    const recurrenceStart = '2026-08-12T10:00';
    const recurrence = getTaskRecurrence({
      id: recurrenceId,
      userId,
      taskId,
      startDate: '2026-08-01T10:00',
    });
    const sourceTask = getTask({
      id: taskId,
      userId,
      recurrenceId,
      name: 'Virtual source',
      description: 'Virtual description',
      priority: 2,
      startDate: '2026-08-01T10:00',
      deadline: '2026-08-01T12:00',
    });
    const taskTypeService = {
      getType: jest.fn().mockReturnValue({
        isOrigin: false,
        isVirtual: true,
        isOverride: false,
        data: { recurrenceId, date: recurrenceStart },
      }),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const taskRecurrenceService = {
      getRecurrence: jest.fn().mockResolvedValue(recurrence),
    };
    const taskOverrideService = {
      upsertOverride: jest.fn().mockImplementation((override) => restoreSavedOverride(override, overrideId)),
    };
    const useCase = createUseCase({
      taskCheckerService,
      taskTypeService,
      taskRecurrenceService,
      taskOverrideService,
    });

    const result = await useCase.execute(
      new SoftDeleteTaskCommand({
        userId,
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId, date: recurrenceStart }),
      }),
    );

    expect(result).toMatchObject({
      id: TaskIdBuilder.wrapOverrideId({ recurrenceId, overrideId, date: recurrenceStart }),
      userId,
      name: 'Virtual source',
      description: 'Virtual description',
      priority: 2,
      startDate: recurrenceStart,
      deadline: '2026-08-12T12:00',
      status: TaskStatus.DELETED,
    });
  });

  test('returns deleted override task', async () => {
    const userId = 77;
    const taskId = 7001;
    const recurrenceId = 8001;
    const overrideId = 9001;
    const recurrenceStart = '2026-08-12T10:00';
    const recurrence = getTaskRecurrence({
      id: recurrenceId,
      userId,
      taskId,
      startDate: '2026-08-01T10:00',
    });
    const sourceTask = getTask({
      id: taskId,
      userId,
      recurrenceId,
      startDate: '2026-08-01T10:00',
      deadline: '2026-08-01T12:00',
    });
    const currentOverride = TaskOverride.restore({
      recurrenceId,
      recurrenceStart: DateVo.restore(recurrenceStart),
      type: TaskOverrideType.OVERRIDE,
      task: getTask({
        id: overrideId,
        userId,
        name: 'Override task',
        description: 'Override description',
        priority: 4,
        startDate: recurrenceStart,
        deadline: '2026-08-12T13:00',
      }),
    });
    const taskTypeService = {
      getType: jest.fn().mockReturnValue({
        isOrigin: false,
        isVirtual: false,
        isOverride: true,
        data: { recurrenceId, overrideId, date: recurrenceStart },
      }),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const taskRecurrenceService = {
      getRecurrence: jest.fn().mockResolvedValue(recurrence),
      deleteRecurrence: jest.fn(),
    };
    const taskOverrideService = {
      getOverride: jest.fn().mockResolvedValue(currentOverride),
      getOverridesByRecurrenceId: jest.fn().mockResolvedValue([currentOverride]),
      upsertOverride: jest.fn().mockImplementation((override) => override),
    };
    const useCase = createUseCase({
      taskCheckerService,
      taskTypeService,
      taskRecurrenceService,
      taskOverrideService,
    });

    const result = await useCase.execute(
      new SoftDeleteTaskCommand({
        userId,
        taskId: TaskIdBuilder.wrapOverrideId({ recurrenceId, overrideId, date: recurrenceStart }),
      }),
    );

    expect(result).toMatchObject({
      id: TaskIdBuilder.wrapOverrideId({ recurrenceId, overrideId, date: recurrenceStart }),
      userId,
      name: 'Override task',
      description: 'Override description',
      priority: 4,
      startDate: recurrenceStart,
      deadline: '2026-08-12T13:00',
      status: TaskStatus.DELETED,
    });
  });
});
