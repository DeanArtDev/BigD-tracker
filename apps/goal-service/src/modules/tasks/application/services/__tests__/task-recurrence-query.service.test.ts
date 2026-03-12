import { TaskRecurrenceQueryService } from '../task-recurrence-query.service';
import { TaskOverride } from '@/modules/tasks/domain';
import { GoalServiceRequestContext } from '@shared/request-context';
import { DateVo } from '@big-d/api-utils';
import { getTask, getTaskRecurrence } from '@shared/__tests__/entities';
import {
  RecurrenceFrequency,
  TaskOverrideType,
  TaskRecurrenceStatus,
  TaskRecurrenceWeekday,
  TaskStatus,
} from '@big-d/api-contracts';

const USER_TIMEZONES = ['UTC', 'Asia/Novosibirsk', 'America/New_York'] as const;
const SKIPPED_OVERRIDE_TYPES = [
  TaskOverrideType.CANCELED,
  TaskOverrideType.DELETED,
  TaskOverrideType.ARCHIVED,
  TaskOverrideType.MOVED,
] as const;

type CalculateTasksResult = Awaited<ReturnType<TaskRecurrenceQueryService['calculateTasks']>>;

function buildOverride(input: {
  id: number;
  userId: number;
  recurrenceId: number;
  recurrenceStart: string;
  type: TaskOverrideType;
  startDate?: string;
  deadline?: string;
  name?: string;
  description?: string;
}): TaskOverride {
  return TaskOverride.restore({
    task: getTask({
      id: input.id,
      userId: input.userId,
      name: input.name ?? 'Override task',
      description: input.description ?? 'override',
      priority: 2,
      weight: 3,
      status: TaskStatus.IN_PROGRESS,
      startDate: input.startDate ?? '2026-03-02T10:15:00.000Z',
      deadline: input.deadline ?? '2026-03-02T12:00:00.000Z',
    }),
    recurrenceId: input.recurrenceId,
    recurrenceStart: DateVo.restore(input.recurrenceStart),
    type: input.type,
  });
}

async function calculateTasksForUserTimezones(input: {
  recurrence: ReturnType<typeof getTaskRecurrence>;
  overrides: TaskOverride[];
  sourceTask?: ReturnType<typeof getTask>;
  from?: string;
  to?: string;
}): Promise<CalculateTasksResult[]> {
  const results: CalculateTasksResult[] = [];

  for (const userTimezone of USER_TIMEZONES) {
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([input.recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue(input.overrides),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(input.sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);

    const requestContextSpy = jest.spyOn(GoalServiceRequestContext, 'getStore').mockReturnValue({
      state: {
        userTimezone,
      },
    } as never);

    const result = await service.calculateTasks({
      userId: input.recurrence.userId,
      from: input.from ?? '2026-03-02',
      to: input.to ?? '2026-03-02',
    });

    results.push(result);
    requestContextSpy.mockRestore();
  }

  return results;
}

describe('TaskRecurrenceQueryService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns overrides for canceled recurrence but does not generate virtual tasks', async () => {
    const recurrence = getTaskRecurrence({
      id: 9204,
      userId: 778,
      taskId: 9204,
      status: TaskRecurrenceStatus.CANCELED,
      timezone: 'UTC',
      startDate: '2026-01-01T10:00:00.000Z',
      untilDate: '2026-01-02T10:00:00.000Z',
      frequency: RecurrenceFrequency.DAILY,
      pattern: 'FREQ=DAILY;INTERVAL=1',
      weekstart: TaskRecurrenceWeekday.MO,
    });
    const override = TaskOverride.restore({
      task: getTask({
        id: 9304,
        userId: 778,
        name: 'Override task',
        description: 'override',
        priority: 2,
        weight: 3,
        status: TaskStatus.IN_PROGRESS,
        startDate: '2026-01-01T10:15:00.000Z',
        deadline: '2026-01-01T12:00:00.000Z',
      }),
      recurrenceId: recurrence.id,
      recurrenceStart: DateVo.restore('2026-01-01T10:00:00.000Z'),
      type: TaskOverrideType.OVERRIDE,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([override]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn(),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);

    const result = await service.calculateTasks({
      userId: 778,
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-02T00:00:00.000Z',
    });

    expect(result.virtualViews).toHaveLength(1);
    expect(result.virtualViews[0]).toMatchObject({
      id: 'ov::9204::2026-01-01T10:00:00.000Z::9304',
      userId: 778,
      name: 'Override task',
      description: 'override',
      priority: 2,
      weight: 3,
      status: TaskStatus.IN_PROGRESS,
      startDate: '2026-01-01T10:15:00.000Z',
      deadline: '2026-01-01T12:00:00.000Z',
    });
    expect(result.recurrences).toEqual([recurrence]);
    expect(tasksOverridesRepository.getManyRecurrences).toHaveBeenCalledTimes(1);
    expect(tasksOverridesRepository.getManyOverrides).toHaveBeenCalledTimes(1);
    expect(taskCheckerService.ensureTaskExists).not.toHaveBeenCalled();
  });

  test.each(SKIPPED_OVERRIDE_TYPES)('skips canceled recurrence override with type %s', async (overrideType) => {
    const recurrence = getTaskRecurrence({
      id: 9205,
      userId: 779,
      taskId: 9205,
      status: TaskRecurrenceStatus.CANCELED,
      timezone: 'UTC',
      startDate: '2026-03-01T10:00:00.000Z',
      untilDate: '2026-03-02T10:00:00.000Z',
    });
    const override = buildOverride({
      id: 9305,
      userId: 779,
      recurrenceId: recurrence.id,
      recurrenceStart: '2026-03-02T10:00:00.000Z',
      type: overrideType,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([override]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn(),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);

    const result = await service.calculateTasks({
      userId: 779,
      from: '2026-03-02',
      to: '2026-03-02',
    });

    expect(result.virtualViews).toEqual([]);
    expect(taskCheckerService.ensureTaskExists).not.toHaveBeenCalled();
  });

  test('generates a virtual task for active recurrence when there is no override', async () => {
    const recurrence = getTaskRecurrence({
      id: 9401,
      userId: 880,
      taskId: 9401,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'UTC',
      startDate: '2026-03-01T10:00:00.000Z',
      untilDate: '2026-03-02T10:00:00.000Z',
    });
    const sourceTask = getTask({
      id: 9401,
      userId: 880,
      name: 'Recurring task',
      description: 'repeat',
      priority: 4,
      weight: 5,
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-01T12:00:00.000Z',
      status: TaskStatus.IN_PROGRESS,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);

    const result = await service.calculateTasks({
      userId: 880,
      from: '2026-03-02',
      to: '2026-03-02',
    });

    expect(result.virtualViews).toHaveLength(1);
    expect(result.virtualViews[0]).toMatchObject({
      id: 'v::9401::2026-03-02T10:00:00.000Z',
      userId: 880,
      name: 'Recurring task',
      description: 'repeat',
      priority: 4,
      weight: 5,
      status: TaskStatus.IN_PROGRESS,
      startDate: '2026-03-02T10:00:00.000Z',
      deadline: '2026-03-02T12:00:00.000Z',
    });
    expect(taskCheckerService.ensureTaskExists).toHaveBeenCalledTimes(1);
  });

  test('generates a virtual task with IN_PROGRESS status even if source task has another status', async () => {
    const recurrence = getTaskRecurrence({
      id: 94010,
      userId: 880,
      taskId: 94010,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'UTC',
      startDate: '2026-03-01T10:00:00.000Z',
      untilDate: '2026-03-02T10:00:00.000Z',
    });
    const sourceTask = getTask({
      id: 94010,
      userId: 880,
      name: 'Recurring task',
      description: 'repeat',
      priority: 4,
      weight: 5,
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-01T12:00:00.000Z',
      status: TaskStatus.NOT_STARTED,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);

    const result = await service.calculateTasks({
      userId: 880,
      from: '2026-03-02',
      to: '2026-03-02',
    });

    expect(result.virtualViews).toHaveLength(1);
    expect(result.virtualViews[0]).toMatchObject({
      id: 'v::94010::2026-03-02T10:00:00.000Z',
      status: TaskStatus.IN_PROGRESS,
      startDate: '2026-03-02T10:00:00.000Z',
      deadline: '2026-03-02T12:00:00.000Z',
    });
  });

  test('returns long virtual task when requested day intersects occurrence interval', async () => {
    const recurrence = getTaskRecurrence({
      id: 94011,
      userId: 880,
      taskId: 94011,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'UTC',
      startDate: '2026-03-02T10:00:00.000Z',
      untilDate: '2026-03-02T10:00:00.000Z',
      frequency: RecurrenceFrequency.DAILY,
      pattern: 'FREQ=DAILY;INTERVAL=1',
      weekstart: TaskRecurrenceWeekday.MO,
    });
    const sourceTask = getTask({
      id: 94011,
      userId: 880,
      name: 'Long recurring task',
      description: 'repeat',
      priority: 4,
      weight: 5,
      startDate: '2026-03-02T10:00:00.000Z',
      deadline: '2026-03-05T10:00:00.000Z',
      status: TaskStatus.IN_PROGRESS,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);

    const result = await service.calculateTasks({
      userId: 880,
      from: '2026-03-04',
      to: '2026-03-04',
    });

    expect(result.virtualViews).toHaveLength(1);
    expect(result.virtualViews[0]).toMatchObject({
      id: 'v::94011::2026-03-02T10:00:00.000Z',
      userId: 880,
      name: 'Long recurring task',
      description: 'repeat',
      priority: 4,
      weight: 5,
      status: TaskStatus.IN_PROGRESS,
      startDate: '2026-03-02T10:00:00.000Z',
      deadline: '2026-03-05T10:00:00.000Z',
    });
    expect(taskCheckerService.ensureTaskExists).toHaveBeenCalledTimes(1);
  });

  test('returns long virtual task on the last intersecting day', async () => {
    const recurrence = getTaskRecurrence({
      id: 94012,
      userId: 881,
      taskId: 94012,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'UTC',
      startDate: '2026-03-02T10:00:00.000Z',
      untilDate: '2026-03-02T10:00:00.000Z',
      frequency: RecurrenceFrequency.DAILY,
      pattern: 'FREQ=DAILY;INTERVAL=1',
      weekstart: TaskRecurrenceWeekday.MO,
    });
    const sourceTask = getTask({
      id: 94012,
      userId: 881,
      name: 'Long recurring task',
      description: 'repeat',
      priority: 4,
      weight: 5,
      startDate: '2026-03-02T10:00:00.000Z',
      deadline: '2026-03-05T10:00:00.000Z',
      status: TaskStatus.IN_PROGRESS,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);

    const result = await service.calculateTasks({
      userId: 881,
      from: '2026-03-05',
      to: '2026-03-05',
    });

    expect(result.virtualViews).toHaveLength(1);
    expect(result.virtualViews[0]).toMatchObject({
      id: 'v::94012::2026-03-02T10:00:00.000Z',
      userId: 881,
      name: 'Long recurring task',
      description: 'repeat',
      priority: 4,
      weight: 5,
      status: TaskStatus.IN_PROGRESS,
      startDate: '2026-03-02T10:00:00.000Z',
      deadline: '2026-03-05T10:00:00.000Z',
    });
    expect(taskCheckerService.ensureTaskExists).toHaveBeenCalledTimes(1);
  });

  test('returns the same startDate and deadline for long virtual task in non-UTC recurrence timezone', async () => {
    const recurrence = getTaskRecurrence({
      id: 94013,
      userId: 882,
      taskId: 94013,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'America/New_York',
      startDate: '2026-03-10T18:01:00.000Z',
      untilDate: '2026-03-10T18:01:00.000Z',
      frequency: RecurrenceFrequency.DAILY,
      pattern: 'FREQ=DAILY;INTERVAL=1',
      weekstart: TaskRecurrenceWeekday.MO,
    });
    const sourceTask = getTask({
      id: 94013,
      userId: 882,
      name: 'Long recurring task',
      description: 'repeat',
      priority: 4,
      weight: 5,
      startDate: '2026-03-10T18:01:00.000Z',
      deadline: '2026-03-12T20:01:00.000Z',
      status: TaskStatus.IN_PROGRESS,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);

    const result = await service.calculateTasks({
      userId: 882,
      from: '2026-03-11',
      to: '2026-03-11',
    });

    expect(result.virtualViews).toEqual([
      expect.objectContaining({
        startDate: '2026-03-10T18:01:00.000Z',
        deadline: '2026-03-12T20:01:00.000Z',
      }),
    ]);
  });

  test('returns only intersecting long virtual task for multi-day non-UTC recurrence in UTC user timezone', async () => {
    const recurrence = getTaskRecurrence({
      id: 94014,
      userId: 883,
      taskId: 94014,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'America/New_York',
      startDate: '2026-03-10T18:01:00.000Z',
      untilDate: '2026-03-13T18:01:00.000Z',
      frequency: RecurrenceFrequency.DAILY,
      pattern: 'FREQ=DAILY;INTERVAL=1',
      weekstart: TaskRecurrenceWeekday.MO,
    });
    const sourceTask = getTask({
      id: 94014,
      userId: 883,
      name: 'Long recurring task',
      description: 'repeat',
      priority: 4,
      weight: 5,
      startDate: '2026-03-10T18:01:00.000Z',
      deadline: '2026-03-12T20:01:00.000Z',
      status: TaskStatus.IN_PROGRESS,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);
    const requestContextSpy = jest.spyOn(GoalServiceRequestContext, 'getStore').mockReturnValue({
      state: {
        userTimezone: 'Asia/Novosibirsk',
      },
    } as never);

    const result = await service.calculateTasks({
      userId: 883,
      from: '2026-03-11',
      to: '2026-03-11',
    });

    requestContextSpy.mockRestore();

    expect(result.virtualViews).toEqual([
      expect.objectContaining({
        id: 'v::94014::2026-03-10T14:01:00.000Z',
        startDate: '2026-03-10T18:01:00.000Z',
        deadline: '2026-03-12T20:01:00.000Z',
      }),
    ]);
  });

  test('returns multiple overlapping long virtual tasks for multi-day non-UTC recurrence in recurrence user timezone', async () => {
    const recurrence = getTaskRecurrence({
      id: 94016,
      userId: 885,
      taskId: 94016,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'America/New_York',
      startDate: '2026-03-10T18:01:00.000Z',
      untilDate: '2026-03-13T18:01:00.000Z',
      frequency: RecurrenceFrequency.DAILY,
      pattern: 'FREQ=DAILY;INTERVAL=1',
      weekstart: TaskRecurrenceWeekday.MO,
    });
    const sourceTask = getTask({
      id: 94016,
      userId: 885,
      name: 'Long recurring task',
      description: 'repeat',
      priority: 4,
      weight: 5,
      startDate: '2026-03-10T18:01:00.000Z',
      deadline: '2026-03-12T20:01:00.000Z',
      status: TaskStatus.IN_PROGRESS,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);
    const requestContextSpy = jest.spyOn(GoalServiceRequestContext, 'getStore').mockReturnValue({
      state: {
        userTimezone: 'America/New_York',
      },
    } as never);

    const result = await service.calculateTasks({
      userId: 885,
      from: '2026-03-11',
      to: '2026-03-11',
    });

    requestContextSpy.mockRestore();

    expect(result.virtualViews).toEqual([
      expect.objectContaining({
        id: 'v::94016::2026-03-10T14:01:00.000Z',
        startDate: '2026-03-10T18:01:00.000Z',
        deadline: '2026-03-12T20:01:00.000Z',
      }),
      expect.objectContaining({
        id: 'v::94016::2026-03-11T14:01:00.000Z',
        startDate: '2026-03-11T18:01:00.000Z',
        deadline: '2026-03-13T20:01:00.000Z',
      }),
    ]);
  });

  test('does not return extra long virtual tasks for multi-day recurrence in another user timezone', async () => {
    const recurrence = getTaskRecurrence({
      id: 94015,
      userId: 884,
      taskId: 94015,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'America/New_York',
      startDate: '2026-03-10T18:01:00.000Z',
      untilDate: '2026-03-13T18:01:00.000Z',
      frequency: RecurrenceFrequency.DAILY,
      pattern: 'FREQ=DAILY;INTERVAL=1',
      weekstart: TaskRecurrenceWeekday.MO,
    });
    const sourceTask = getTask({
      id: 94015,
      userId: 884,
      name: 'Long recurring task',
      description: 'repeat',
      priority: 4,
      weight: 5,
      startDate: '2026-03-10T18:01:00.000Z',
      deadline: '2026-03-12T20:01:00.000Z',
      status: TaskStatus.IN_PROGRESS,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);
    const requestContextSpy = jest.spyOn(GoalServiceRequestContext, 'getStore').mockReturnValue({
      state: {
        userTimezone: 'Asia/Novosibirsk',
      },
    } as never);

    const result = await service.calculateTasks({
      userId: 884,
      from: '2026-03-11',
      to: '2026-03-11',
    });

    requestContextSpy.mockRestore();

    expect(result.virtualViews).toEqual([
      expect.objectContaining({
        id: 'v::94015::2026-03-10T14:01:00.000Z',
        startDate: '2026-03-10T18:01:00.000Z',
        deadline: '2026-03-12T20:01:00.000Z',
      }),
    ]);
  });

  test('applies overrides correctly regardless of user timezone', async () => {
    const recurrence = getTaskRecurrence({
      id: 9402,
      userId: 889,
      taskId: 9402,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'UTC',
      startDate: '2026-03-01T10:00:00.000Z',
      untilDate: '2026-03-02T10:00:00.000Z',
      frequency: RecurrenceFrequency.DAILY,
      pattern: 'FREQ=DAILY;INTERVAL=1',
      weekstart: TaskRecurrenceWeekday.MO,
    });
    const sourceTask = getTask({
      id: 9402,
      userId: 889,
      name: 'Recurring task',
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-01T12:00:00.000Z',
    });
    const override = TaskOverride.restore({
      task: getTask({
        id: 9502,
        userId: 889,
        name: 'Override task',
        description: 'override',
        priority: 2,
        weight: 3,
        status: TaskStatus.IN_PROGRESS,
        startDate: '2026-03-02T10:15:00.000Z',
        deadline: '2026-03-02T12:00:00.000Z',
      }),
      recurrenceId: recurrence.id,
      recurrenceStart: DateVo.restore('2026-03-02T10:00:00.000Z'),
      type: TaskOverrideType.OVERRIDE,
    });
    const results = await calculateTasksForUserTimezones({
      recurrence,
      overrides: [override],
      sourceTask,
    });

    expect(results).toHaveLength(3);
    expect(results.map((result) => result.virtualViews)).toEqual([
      [
        expect.objectContaining({
          id: 'ov::9402::2026-03-02T10:00:00.000Z::9502',
          name: 'Override task',
          startDate: '2026-03-02T10:15:00.000Z',
          deadline: '2026-03-02T12:00:00.000Z',
        }),
      ],
      [
        expect.objectContaining({
          startDate: '2026-03-02T10:15:00.000Z',
          deadline: '2026-03-02T12:00:00.000Z',
        }),
      ],
      [
        expect.objectContaining({
          startDate: '2026-03-02T10:15:00.000Z',
          deadline: '2026-03-02T12:00:00.000Z',
        }),
      ],
    ]);
  });

  test.each(SKIPPED_OVERRIDE_TYPES)(
    'does not render matching active override with skipped type %s',
    async (overrideType) => {
      const recurrence = getTaskRecurrence({
        id: 9403,
        userId: 881,
        taskId: 9403,
        status: TaskRecurrenceStatus.ACTIVE,
        timezone: 'UTC',
        startDate: '2026-03-01T10:00:00.000Z',
        untilDate: '2026-03-02T10:00:00.000Z',
      });
      const sourceTask = getTask({
        id: 9403,
        userId: 881,
        startDate: '2026-03-01T10:00:00.000Z',
        deadline: '2026-03-01T12:00:00.000Z',
        status: TaskStatus.IN_PROGRESS,
      });
      const override = buildOverride({
        id: 9503,
        userId: 881,
        recurrenceId: recurrence.id,
        recurrenceStart: '2026-03-02T10:00:00.000Z',
        type: overrideType,
      });
      const tasksOverridesRepository = {
        getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
        getManyOverrides: jest.fn().mockResolvedValue([override]),
      };
      const taskCheckerService = {
        ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
      };
      const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);

      const result = await service.calculateTasks({
        userId: 881,
        from: '2026-03-02',
        to: '2026-03-02',
      });

      expect(result.virtualViews).toEqual([]);
    },
  );

  test('renders unmatched active override after generated virtual task', async () => {
    const recurrence = getTaskRecurrence({
      id: 9404,
      userId: 882,
      taskId: 9404,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'UTC',
      startDate: '2026-03-01T10:00:00.000Z',
      untilDate: '2026-03-02T10:00:00.000Z',
    });
    const sourceTask = getTask({
      id: 9404,
      userId: 882,
      name: 'Recurring task',
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-01T12:00:00.000Z',
      status: TaskStatus.IN_PROGRESS,
    });
    const override = buildOverride({
      id: 9504,
      userId: 882,
      recurrenceId: recurrence.id,
      recurrenceStart: '2026-03-02T11:00:00.000Z',
      type: TaskOverrideType.OVERRIDE,
      startDate: '2026-03-02T11:15:00.000Z',
      deadline: '2026-03-02T13:00:00.000Z',
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([override]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);

    const result = await service.calculateTasks({
      userId: 882,
      from: '2026-03-02',
      to: '2026-03-02',
    });

    expect(result.virtualViews).toHaveLength(2);
    expect(result.virtualViews[0]).toMatchObject({
      id: 'v::9404::2026-03-02T10:00:00.000Z',
      startDate: '2026-03-02T10:00:00.000Z',
      deadline: '2026-03-02T12:00:00.000Z',
    });
    expect(result.virtualViews[1]).toMatchObject({
      id: 'ov::9404::2026-03-02T11:00:00.000Z::9504',
      startDate: '2026-03-02T11:15:00.000Z',
      deadline: '2026-03-02T13:00:00.000Z',
    });
  });

  test.each(SKIPPED_OVERRIDE_TYPES)('ignores unmatched skipped active override with type %s', async (overrideType) => {
    const recurrence = getTaskRecurrence({
      id: 9405,
      userId: 883,
      taskId: 9405,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'UTC',
      startDate: '2026-03-01T10:00:00.000Z',
      untilDate: '2026-03-02T10:00:00.000Z',
    });
    const sourceTask = getTask({
      id: 9405,
      userId: 883,
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-01T12:00:00.000Z',
      status: TaskStatus.IN_PROGRESS,
    });
    const override = buildOverride({
      id: 9505,
      userId: 883,
      recurrenceId: recurrence.id,
      recurrenceStart: '2026-03-02T11:00:00.000Z',
      type: overrideType,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([override]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);

    const result = await service.calculateTasks({
      userId: 883,
      from: '2026-03-02',
      to: '2026-03-02',
    });

    expect(result.virtualViews).toHaveLength(1);
    expect(result.virtualViews[0]).toMatchObject({
      id: 'v::9405::2026-03-02T10:00:00.000Z',
      startDate: '2026-03-02T10:00:00.000Z',
      deadline: '2026-03-02T12:00:00.000Z',
    });
  });

  test('returns canceled recurrence overrides with the same start and deadline regardless of user timezone', async () => {
    const recurrence = getTaskRecurrence({
      id: 9503,
      userId: 890,
      taskId: 9503,
      status: TaskRecurrenceStatus.CANCELED,
      timezone: 'Asia/Novosibirsk',
      startDate: '2026-03-01T03:00:00.000Z',
      untilDate: '2026-03-02T03:00:00.000Z',
      frequency: RecurrenceFrequency.DAILY,
      pattern: 'FREQ=DAILY;INTERVAL=1',
      weekstart: TaskRecurrenceWeekday.MO,
    });
    const override = TaskOverride.restore({
      task: getTask({
        id: 9603,
        userId: 890,
        name: 'Canceled override',
        description: 'override',
        priority: 2,
        weight: 3,
        status: TaskStatus.IN_PROGRESS,
        startDate: '2026-03-02T03:15:00.000Z',
        deadline: '2026-03-02T05:00:00.000Z',
      }),
      recurrenceId: recurrence.id,
      recurrenceStart: DateVo.restore('2026-03-02T03:00:00.000Z'),
      type: TaskOverrideType.OVERRIDE,
    });
    const results = await calculateTasksForUserTimezones({
      recurrence,
      overrides: [override],
    });

    expect(results).toHaveLength(3);
    expect(results.map((result) => result.virtualViews)).toEqual([
      [
        expect.objectContaining({
          id: 'ov::9503::2026-03-02T03:00:00.000Z::9603',
          name: 'Canceled override',
          startDate: '2026-03-02T03:15:00.000Z',
          deadline: '2026-03-02T05:00:00.000Z',
        }),
      ],
      [
        expect.objectContaining({
          id: 'ov::9503::2026-03-02T03:00:00.000Z::9603',
          name: 'Canceled override',
          startDate: '2026-03-02T03:15:00.000Z',
          deadline: '2026-03-02T05:00:00.000Z',
        }),
      ],
      [
        expect.objectContaining({
          id: 'ov::9503::2026-03-02T03:00:00.000Z::9603',
          name: 'Canceled override',
          startDate: '2026-03-02T03:15:00.000Z',
          deadline: '2026-03-02T05:00:00.000Z',
        }),
      ],
    ]);
  });

  test('uses UTC when user timezone is missing from request context', async () => {
    const recurrence = getTaskRecurrence({
      id: 9701,
      userId: 901,
      taskId: 9701,
      status: TaskRecurrenceStatus.ACTIVE,
      timezone: 'UTC',
      startDate: '2026-03-01T10:00:00.000Z',
      untilDate: '2026-03-02T10:00:00.000Z',
    });
    const sourceTask = getTask({
      id: 9701,
      userId: 901,
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-01T12:00:00.000Z',
      status: TaskStatus.IN_PROGRESS,
    });
    const tasksOverridesRepository = {
      getManyRecurrences: jest.fn().mockResolvedValue([recurrence]),
      getManyOverrides: jest.fn().mockResolvedValue([]),
    };
    const taskCheckerService = {
      ensureTaskExists: jest.fn().mockResolvedValue(sourceTask),
    };
    const service = new TaskRecurrenceQueryService(tasksOverridesRepository as never, taskCheckerService as never);
    jest.spyOn(GoalServiceRequestContext, 'getStore').mockReturnValue(undefined);

    const result = await service.calculateTasks({
      userId: 901,
      from: '2026-03-02',
      to: '2026-03-02',
    });

    expect(result.virtualViews).toHaveLength(1);
    expect(result.virtualViews[0]).toMatchObject({
      startDate: '2026-03-02T10:00:00.000Z',
      deadline: '2026-03-02T12:00:00.000Z',
    });
  });

  test('createRule limits occurrences by untilDate', () => {
    const service = new TaskRecurrenceQueryService({} as never, {} as never);

    const rule = service.createRule({
      frequency: RecurrenceFrequency.DAILY,
      weekstart: TaskRecurrenceWeekday.MO,
      startDate: '2026-03-01T10:00:00.000Z',
      untilDate: '2026-03-03T10:00:00.000Z',
      timezone: 'UTC',
    });

    expect(
      rule
        .between(new Date('2026-03-01T00:00:00.000Z'), new Date('2026-03-05T00:00:00.000Z'), true)
        .map((date) => date.toISOString()),
    ).toEqual(['2026-03-01T10:00:00.000Z', '2026-03-02T10:00:00.000Z', '2026-03-03T10:00:00.000Z']);
  });

  test('createRule works without untilDate', () => {
    const service = new TaskRecurrenceQueryService({} as never, {} as never);

    const rule = service.createRule({
      frequency: RecurrenceFrequency.DAILY,
      weekstart: TaskRecurrenceWeekday.MO,
      startDate: '2026-03-01T10:00:00.000Z',
      timezone: 'UTC',
    });

    expect(
      rule
        .between(new Date('2026-03-01T00:00:00.000Z'), new Date('2026-03-05T00:00:00.000Z'), true)
        .map((date) => date.toISOString()),
    ).toEqual([
      '2026-03-01T10:00:00.000Z',
      '2026-03-02T10:00:00.000Z',
      '2026-03-03T10:00:00.000Z',
      '2026-03-04T10:00:00.000Z',
    ]);
  });

  test('createTimePoint uses occurrence date with source task time in recurrence timezone', () => {
    const service = new TaskRecurrenceQueryService({} as never, {} as never);

    const result = service.createTimePoint('2026-03-02T00:00:00.000Z', 'Asia/Novosibirsk', '2026-03-01T03:15:30.123Z');

    expect(result.toISOString()).toBe('2026-03-02T10:15:30.123Z');
  });
});
