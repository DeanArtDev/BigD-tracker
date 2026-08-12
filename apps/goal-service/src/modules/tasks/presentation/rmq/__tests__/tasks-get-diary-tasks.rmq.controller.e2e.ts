import { initTestEnvironment } from '@/../jest.setup';
import { TaskIdBuilder, TaskOverride } from '@/modules/tasks/domain';
import { GroupsToken, TasksOverridesToken, TasksToken } from '@/modules/tasks/tokens';
import {
  GoalGetDiaryTasks,
  RecurrenceFrequency,
  TaskOverrideType,
  TaskRecurrenceWeekday,
  TaskStatus,
} from '@big-d/api-contracts';
import { DateVo, specToDebugString } from '@big-d/api-utils';
import { CORRELATION_HEADER_KEY, USER_TIME_ZONE_HEADER_KEY } from '@big-d/observability';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import {
  buildPayload,
  connectRmqClients,
  createTestingModule,
  expectTransaction,
  firstArg,
  nthArgs,
  sendMessageBuilder,
} from '@shared/__tests__';
import { getTask, getTaskRecurrence, getTaskView } from '@shared/__tests__/entities';
import {
  groupReadRepoMock,
  groupWriteRepoMock,
  inboxReadRepoMock,
  tasksOverridesWriteRepoMock,
  tasksReadRepoMock,
  tasksWriteRepoMock,
} from '@shared/__tests__';

initTestEnvironment();

const toDiaryTaskResponse = (taskView: ReturnType<typeof getTaskView>) => ({
  id: taskView.id,
  userId: taskView.userId,
  groupId: taskView.groupId,
  name: taskView.name,
  description: taskView.description,
  priority: taskView.priority,
  cancelReason: taskView.cancelReason,
  startDate: taskView.startDate,
  deadline: taskView.deadline,
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

  describe(`${GoalGetDiaryTasks.pattern}`, () => {
    test('should return merged diary items with virtual tasks sorted by startDate', async () => {
      const userId = 501;
      const filter = {
        from: '2026-03-02T00:00:00.000Z',
        to: '2026-03-03T23:59:59.000Z',
      };

      const sourceTask = getTask({
        id: 9201,
        userId,
        name: 'Recurring task',
        description: 'repeat',
        priority: 2,
        startDate: '2026-03-02T10:15:00.000Z',
        deadline: '2026-03-02T12:00:00.000Z',
      });
      const recurrence = getTaskRecurrence({
        id: 9201,
        userId,
        taskId: sourceTask.id,
        timezone: 'UTC',
        startDate: '2026-03-02T10:15:00.000Z',
        untilDate: '2026-03-03T23:59:59.000Z',
        frequency: RecurrenceFrequency.DAILY,
        pattern: 'FREQ=DAILY;INTERVAL=1',
        weekstart: TaskRecurrenceWeekday.MO,
      });

      const regularTask = getTaskView({
        id: 9301,
        userId,
        name: 'Regular task',
        description: 'single',
        priority: 3,
        status: TaskStatus.IN_PROGRESS,
        startDate: '2026-03-02T09:00:00.000Z',
        deadline: '2026-03-02T11:00:00.000Z',
      });

      tasksOverridesWriteRepoMock.getManyRecurrences.mockResolvedValueOnce([recurrence]);
      tasksOverridesWriteRepoMock.getManyOverrides.mockResolvedValueOnce([]);
      tasksWriteRepoMock.getTaskById.mockResolvedValue(sourceTask);
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([regularTask]);

      const payload: GoalGetDiaryTasks.Request = buildPayload({
        data: {
          userId,
          filter,
        },
      });

      const res = await sendMessage<GoalGetDiaryTasks.Response, GoalGetDiaryTasks.Request>(
        GoalGetDiaryTasks.pattern,
        payload,
      );

      expect(tasksOverridesWriteRepoMock.getManyRecurrences).toHaveBeenCalledTimes(1);
      expect(tasksOverridesWriteRepoMock.getManyOverrides).toHaveBeenCalledTimes(1);
      expect(tasksReadRepoMock.getByRange).toHaveBeenCalledTimes(1);

      const recurrencesSpec = specToDebugString(firstArg(tasksOverridesWriteRepoMock.getManyRecurrences));
      expect(recurrencesSpec).toContain('tasks.policy.get-recurrences-by-range');
      expect(recurrencesSpec).toContain('tasks-recurrences.byStartDateLessOrEqual');
      expect(recurrencesSpec).toContain('tasks-recurrences.byUserId');

      const overridesSpec = specToDebugString(firstArg(tasksOverridesWriteRepoMock.getManyOverrides));
      expect(overridesSpec).toContain('tasks.policy.get-tasks-overrides');
      expect(overridesSpec).toContain('tasks.overrideByUserId');
      expect(overridesSpec).toContain('tasks.overridesByMasterIds');
      expect(overridesSpec).toContain('tasks.overrideByStartDateInRange');

      const tasksSpec = specToDebugString(firstArg(tasksReadRepoMock.getByRange));
      expect(tasksSpec).toContain('tasks.byUserId');
      expect(tasksSpec).toContain('tasks.byStartDateLessOrEqual');
      expect(tasksSpec).toContain('tasks.byDeadlineGreaterOrEqual');
      expect(tasksSpec).toContain('tasks.byIds');

      expect(nthArgs(1, tasksOverridesWriteRepoMock.getManyRecurrences)).toEqual(expectTransaction());
      expect(nthArgs(1, tasksOverridesWriteRepoMock.getManyOverrides)).toEqual(expectTransaction());
      expect(nthArgs(3, tasksReadRepoMock.getByRange)).toEqual(expectTransaction());

      expect(res.data.items).toHaveLength(3);
      expect(res.data.items[0]).toEqual(toDiaryTaskResponse(regularTask));
      expect(res.data.items[1]).toMatchObject({
        id: TaskIdBuilder.wrapVirtualId({
          recurrenceId: recurrence.id,
          date: '2026-03-02T10:15:00.000Z',
        }),
        userId,
        name: 'Recurring task',
        description: 'repeat',
        priority: 2,
        status: TaskStatus.IN_PROGRESS,
        startDate: '2026-03-02T10:15',
        deadline: '2026-03-02T12:00',
      });
      expect(res.data.items[2]).toMatchObject({
        id: TaskIdBuilder.wrapVirtualId({
          recurrenceId: recurrence.id,
          date: '2026-03-03T10:15:00.000Z',
        }),
        userId,
        name: 'Recurring task',
        description: 'repeat',
        priority: 2,
        status: TaskStatus.IN_PROGRESS,
        startDate: '2026-03-03T10:15',
        deadline: '2026-03-03T12:00',
      });
    });

    test('should apply each override to the correct virtual task when recurrences share same time', async () => {
      const userId = 502;
      const filter = {
        from: '2026-03-02T00:00:00.000Z',
        to: '2026-03-02T23:59:59.000Z',
      };

      const sourceTaskA = getTask({
        id: 9202,
        userId,
        name: 'Recurring task A',
        description: 'repeat A',
        priority: 2,
        startDate: '2026-03-02T10:15:00.000Z',
        deadline: '2026-03-02T12:00:00.000Z',
      });
      const sourceTaskB = getTask({
        id: 9203,
        userId,
        name: 'Recurring task B',
        description: 'repeat B',
        priority: 3,
        startDate: '2026-03-02T10:15:00.000Z',
        deadline: '2026-03-02T12:00:00.000Z',
      });
      const recurrenceA = getTaskRecurrence({
        id: 9202,
        userId,
        taskId: sourceTaskA.id,
        timezone: 'UTC',
        startDate: '2026-03-02T10:15:00.000Z',
        untilDate: '2026-03-02T23:59:59.000Z',
        frequency: RecurrenceFrequency.DAILY,
        pattern: 'FREQ=DAILY;INTERVAL=1',
        weekstart: TaskRecurrenceWeekday.MO,
      });
      const recurrenceB = getTaskRecurrence({
        id: 9203,
        userId,
        taskId: sourceTaskB.id,
        timezone: 'UTC',
        startDate: '2026-03-02T10:15:00.000Z',
        untilDate: '2026-03-02T23:59:59.000Z',
        frequency: RecurrenceFrequency.DAILY,
        pattern: 'FREQ=DAILY;INTERVAL=1',
        weekstart: TaskRecurrenceWeekday.MO,
      });

      const recurrenceStart = '2026-03-02T10:15:00.000Z';

      const overrideForA = TaskOverride.restore({
        task: getTask({
          id: 9302,
          userId,
          name: 'Override for A',
          description: 'override A',
          priority: 1,
          startDate: '2026-03-02T08:45:00.000Z',
          deadline: '2026-03-02T11:30:00.000Z',
          status: TaskStatus.IN_PROGRESS,
        }),
        recurrenceId: recurrenceA.id,
        recurrenceStart: DateVo.restore(recurrenceStart),
        type: TaskOverrideType.OVERRIDE,
      });

      const overrideForB = TaskOverride.restore({
        task: getTask({
          id: 9303,
          userId,
          name: 'Override for B',
          description: 'override B',
          priority: 4,
          startDate: '2026-03-02T16:20:00.000Z',
          deadline: '2026-03-02T17:00:00.000Z',
          status: TaskStatus.IN_PROGRESS,
        }),
        recurrenceId: recurrenceB.id,
        recurrenceStart: DateVo.restore(recurrenceStart),
        type: TaskOverrideType.OVERRIDE,
      });

      tasksOverridesWriteRepoMock.getManyRecurrences.mockResolvedValueOnce([recurrenceA, recurrenceB]);
      tasksOverridesWriteRepoMock.getManyOverrides
        .mockResolvedValueOnce([overrideForA])
        .mockResolvedValueOnce([overrideForB]);
      tasksWriteRepoMock.getTaskById.mockImplementation(({ taskId }) => {
        return taskId === sourceTaskA.id ? sourceTaskA : sourceTaskB;
      });
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([]);

      const payload: GoalGetDiaryTasks.Request = buildPayload({
        data: {
          userId,
          filter,
        },
      });

      const res = await sendMessage<GoalGetDiaryTasks.Response, GoalGetDiaryTasks.Request>(
        GoalGetDiaryTasks.pattern,
        payload,
      );

      expect(res.data.items).toHaveLength(2);
      expect(tasksOverridesWriteRepoMock.getManyOverrides).toHaveBeenCalledTimes(2);
      expect(res.data.items[0]).toMatchObject({
        id: TaskIdBuilder.wrapOverrideId({
          recurrenceId: recurrenceA.id,
          overrideId: overrideForA.id,
          date: DateVo.format(recurrenceStart),
        }),
        userId,
        name: 'Override for A',
        description: 'override A',
        priority: 1,
        startDate: '2026-03-02T08:45',
      });
      expect(res.data.items[1]).toMatchObject({
        id: TaskIdBuilder.wrapOverrideId({
          recurrenceId: recurrenceB.id,
          overrideId: overrideForB.id,
          date: DateVo.format(recurrenceStart),
        }),
        userId,
        name: 'Override for B',
        description: 'override B',
        priority: 4,
        startDate: '2026-03-02T16:20',
      });
    });

    test('should return empty items when no regular and recurrence tasks found', async () => {
      const payload: GoalGetDiaryTasks.Request = buildPayload({
        data: {
          userId: 777,
          filter: {
            from: '2026-01-01T00:00:00.000Z',
            to: '2026-01-02T00:00:00.000Z',
          },
        },
      });

      tasksOverridesWriteRepoMock.getManyRecurrences.mockResolvedValueOnce([]);
      tasksOverridesWriteRepoMock.getManyOverrides.mockResolvedValueOnce([]);
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([]);

      const res = await sendMessage<GoalGetDiaryTasks.Response, GoalGetDiaryTasks.Request>(
        GoalGetDiaryTasks.pattern,
        payload,
      );

      expect(tasksOverridesWriteRepoMock.getManyRecurrences).toHaveBeenCalledTimes(1);
      expect(tasksOverridesWriteRepoMock.getManyOverrides).toHaveBeenCalledTimes(0);
      expect(tasksReadRepoMock.getByRange).toHaveBeenCalledTimes(1);
      expect(res).toEqual({
        data: {
          items: [],
        },
      });
    });

    test('should build origin tasks range by user timezone day bounds', async () => {
      const userId = 790;

      tasksOverridesWriteRepoMock.getManyRecurrences.mockReset();
      tasksOverridesWriteRepoMock.getManyOverrides.mockReset();
      tasksReadRepoMock.getByRange.mockReset();
      tasksOverridesWriteRepoMock.getManyRecurrences.mockResolvedValueOnce([]);
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([]);

      const payload: GoalGetDiaryTasks.Request = new RmqRecordBuilder({
        data: {
          userId,
          filter: {
            from: '2026-03-02T00:00:00.000Z',
            to: '2026-03-02T00:00:00.000Z',
          },
        },
      })
        .setOptions({
          headers: {
            [CORRELATION_HEADER_KEY]: 'origin-range-correlation',
            [USER_TIME_ZONE_HEADER_KEY]: 'Asia/Novosibirsk',
          },
        })
        .build();

      await sendMessage<GoalGetDiaryTasks.Response, GoalGetDiaryTasks.Request>(GoalGetDiaryTasks.pattern, payload);

      const tasksSpec = firstArg(tasksReadRepoMock.getByRange) as {
        kind?: string;
        children?: Array<{ toExpr?: (...args: unknown[]) => unknown }>;
      };
      const startDateExpr = tasksSpec.children?.[1]?.toExpr?.((...args: unknown[]) => args) as unknown[];
      const deadlineExpr = tasksSpec.children?.[2]?.toExpr?.((...args: unknown[]) => args) as unknown[];

      expect(startDateExpr[0]).toBe('tasks.start_date');
      expect(startDateExpr[1]).toBe('<=');
      expect((startDateExpr[2] as Date).toISOString()).toBe('2026-03-02T16:59:59.999Z');

      expect(deadlineExpr[0]).toBe('tasks.deadline');
      expect(deadlineExpr[1]).toBe('>=');
      expect((deadlineExpr[2] as Date).toISOString()).toBe('2026-03-01T17:00:00.000Z');
    });

    test('should exclude deleted and archived origin tasks from range query', async () => {
      const userId = 791;

      tasksOverridesWriteRepoMock.getManyRecurrences.mockReset();
      tasksOverridesWriteRepoMock.getManyOverrides.mockReset();
      tasksReadRepoMock.getByRange.mockReset();
      tasksOverridesWriteRepoMock.getManyRecurrences.mockResolvedValueOnce([]);
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([]);

      const payload: GoalGetDiaryTasks.Request = buildPayload({
        data: {
          userId,
          filter: {
            from: '2026-03-02T00:00:00.000Z',
            to: '2026-03-02T23:59:59.000Z',
          },
        },
      });

      await sendMessage<GoalGetDiaryTasks.Response, GoalGetDiaryTasks.Request>(GoalGetDiaryTasks.pattern, payload);

      const tasksSpec = specToDebugString(firstArg(tasksReadRepoMock.getByRange));

      expect(tasksSpec).toContain('NOT(');
      expect(tasksSpec).toContain('tasks.byStatus');
    });

    test('should return weekly virtual tasks only for Wednesday, Friday and Saturday', async () => {
      const userId = 888;
      const sourceTask = getTask({
        id: 9401,
        userId,
        startDate: '2026-03-01T10:00:00.000Z',
        deadline: '2026-03-01T12:00:00.000Z',
      });
      const recurrence = getTaskRecurrence({
        id: 9401,
        userId,
        taskId: sourceTask.id,
        timezone: 'UTC',
        startDate: '2026-03-01T10:00:00.000Z',
        untilDate: '2026-03-31T10:00:00.000Z',
        frequency: RecurrenceFrequency.WEEKLY,
        pattern: 'FREQ=WEEKLY;INTERVAL=1',
        weekstart: TaskRecurrenceWeekday.MO,
        weekdays: [TaskRecurrenceWeekday.WE, TaskRecurrenceWeekday.FR, TaskRecurrenceWeekday.SA],
      });

      tasksOverridesWriteRepoMock.getManyRecurrences.mockResolvedValueOnce([recurrence]);
      tasksOverridesWriteRepoMock.getManyOverrides.mockResolvedValueOnce([]);
      tasksWriteRepoMock.getTaskById.mockResolvedValue(sourceTask);
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([]);

      const payload: GoalGetDiaryTasks.Request = buildPayload({
        data: {
          userId,
          filter: {
            from: '2026-03-02T00:00:00.000Z',
            to: '2026-03-08T23:59:59.000Z',
          },
        },
      });

      const res = await sendMessage<GoalGetDiaryTasks.Response, GoalGetDiaryTasks.Request>(
        GoalGetDiaryTasks.pattern,
        payload,
      );

      expect(res.data.items).toHaveLength(3);

      const weekdays = res.data.items.map((item) => new Date(item.startDate as string).getUTCDay());
      expect(new Set(weekdays)).toEqual(new Set([3, 5, 6]));
      expect(weekdays.every((weekday) => [3, 5, 6].includes(weekday))).toBe(true);
    });

    test('should respect Asia/Novosibirsk timezone for weekly weekdays', async () => {
      const userId = 889;
      const sourceTask = getTask({
        id: 9402,
        userId,
        startDate: '2026-03-01T03:00:00.000Z',
        deadline: '2026-03-01T05:00:00.000Z',
      });
      const recurrence = getTaskRecurrence({
        id: 9402,
        userId,
        taskId: sourceTask.id,
        timezone: 'Asia/Novosibirsk',
        startDate: '2026-03-01T03:00:00.000Z',
        untilDate: '2026-03-31T03:00:00.000Z',
        frequency: RecurrenceFrequency.WEEKLY,
        pattern: 'FREQ=WEEKLY;INTERVAL=1',
        weekstart: TaskRecurrenceWeekday.MO,
        weekdays: [TaskRecurrenceWeekday.WE, TaskRecurrenceWeekday.FR, TaskRecurrenceWeekday.SA],
      });

      tasksOverridesWriteRepoMock.getManyRecurrences.mockResolvedValueOnce([recurrence]);
      tasksOverridesWriteRepoMock.getManyOverrides.mockResolvedValueOnce([]);
      tasksWriteRepoMock.getTaskById.mockResolvedValue(sourceTask);
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([]);

      const payload: GoalGetDiaryTasks.Request = new RmqRecordBuilder({
        data: {
          userId,
          filter: {
            from: '2026-03-02T00:00:00.000Z',
            to: '2026-03-08T23:59:59.000Z',
          },
        },
      })
        .setOptions({
          headers: {
            [CORRELATION_HEADER_KEY]: 'tz-correlation',
            [USER_TIME_ZONE_HEADER_KEY]: 'Asia/Novosibirsk',
          },
        })
        .build();

      const res = await sendMessage<GoalGetDiaryTasks.Response, GoalGetDiaryTasks.Request>(
        GoalGetDiaryTasks.pattern,
        payload,
      );

      expect(res.data.items).toHaveLength(3);

      const weekdaysInTimezone = res.data.items.map((item) =>
        new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          timeZone: 'Asia/Novosibirsk',
        }).format(new Date(item.startDate as string)),
      );

      expect(weekdaysInTimezone).toEqual(['Wed', 'Fri', 'Sat']);
    });
  });
});
