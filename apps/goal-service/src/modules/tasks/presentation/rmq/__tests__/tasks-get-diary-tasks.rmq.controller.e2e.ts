import { initTestEnvironment } from '@/../jest.setup';
import { TaskIdBuilder, TaskOverride } from '@/modules/tasks/domain';
import { GroupsToken, TasksOverridesToken, TasksToken } from '@/modules/tasks/tokens';
import {
  GoalGetDiaryTasks,
  RecurrenceFrequency,
  TaskRecurrenceWeekday,
  TaskOverrideType,
  TaskStatus,
} from '@big-d/api-contracts';
import { CORRELATION_HEADER_KEY, specToDebugString, USER_TIME_ZONE_HEADER_KEY } from '@big-d/api-utils';
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
import { getTask, getTaskView } from '@shared/__tests__/entities';
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
  weight: taskView.weight,
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

      const masterEvent = getTask({
        id: 9201,
        userId,
        name: 'Recurring task',
        description: 'repeat',
        priority: 2,
        weight: 4,
        startDate: '2026-03-02T10:15:00.000Z',
        deadline: '2026-03-02T12:00:00.000Z',
        recurrence: {
          start: '2026-03-02T10:15:00.000Z',
          end: '2026-03-03T10:15:00.000Z',
          frequency: RecurrenceFrequency.DAILY,
        },
      });

      const regularTask = getTaskView({
        id: 9301,
        userId,
        name: 'Regular task',
        description: 'single',
        priority: 3,
        weight: 2,
        status: TaskStatus.IN_PROGRESS,
        startDate: '2026-03-02T09:00:00.000Z',
        deadline: '2026-03-02T11:00:00.000Z',
      });

      tasksOverridesWriteRepoMock.getManyMasterEvents.mockResolvedValueOnce([masterEvent]);
      tasksOverridesWriteRepoMock.getManyOverrides.mockResolvedValueOnce([]);
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

      expect(tasksOverridesWriteRepoMock.getManyMasterEvents).toHaveBeenCalledTimes(1);
      expect(tasksOverridesWriteRepoMock.getManyOverrides).toHaveBeenCalledTimes(1);
      expect(tasksReadRepoMock.getByRange).toHaveBeenCalledTimes(1);

      expect(specToDebugString(firstArg(tasksOverridesWriteRepoMock.getManyMasterEvents))).toMatchInlineSnapshot(`
        "AND[tasks.policy.get-master-events](
          tasks.byStartDateLessOrEqual,
          tasks.byUserId,
          tasks.hasRecurrence
        )"
      `);
      expect(specToDebugString(firstArg(tasksOverridesWriteRepoMock.getManyOverrides))).toMatchInlineSnapshot(`
        "AND[tasks.policy.get-tasks-overrides](
          tasks.overrideByUserId,
          tasks.overridesByMasterIds,
          tasks.overrideByOccurrenceStartLessOrEqual,
          tasks.overrideByOccurrenceStartGreaterOrEqual
        )"
      `);
      expect(specToDebugString(firstArg(tasksReadRepoMock.getByRange))).toMatchInlineSnapshot(`
        "AND(
          tasks.byUserId,
          tasks.byStartDateLessOrEqual,
          tasks.byDeadlineGreaterOrEqual,
          NOT(
            tasks.hasRecurrence
          )
        )"
      `);

      expect(nthArgs(1, tasksOverridesWriteRepoMock.getManyMasterEvents)).toEqual(expectTransaction());
      expect(nthArgs(1, tasksOverridesWriteRepoMock.getManyOverrides)).toEqual(expectTransaction());
      expect(nthArgs(3, tasksReadRepoMock.getByRange)).toEqual(expectTransaction());

      expect(res.data.items).toHaveLength(3);
      expect(res.data.items[0]).toEqual(toDiaryTaskResponse(regularTask));
      expect(res.data.items[1]).toMatchObject({
        id: TaskIdBuilder.wrapVirtualId({
          masterTaskId: masterEvent.id,
          timestamp: new Date('2026-03-02T10:15:00.000Z').getTime(),
        }),
        userId,
        name: 'Recurring task',
        description: 'repeat',
        priority: 2,
        weight: 4,
        status: TaskStatus.IN_PROGRESS,
        startDate: '2026-03-02T10:15:00.000Z',
        deadline: '2026-03-02T12:00:00.000Z',
      });
      expect(res.data.items[2]).toMatchObject({
        id: TaskIdBuilder.wrapVirtualId({
          masterTaskId: masterEvent.id,
          timestamp: new Date('2026-03-03T10:15:00.000Z').getTime(),
        }),
        userId,
        name: 'Recurring task',
        description: 'repeat',
        priority: 2,
        weight: 4,
        status: TaskStatus.IN_PROGRESS,
        startDate: '2026-03-03T10:15:00.000Z',
        deadline: '2026-03-03T12:00:00.000Z',
      });
    });

    test('should apply each override to the correct virtual task when masters share same time', async () => {
      const userId = 502;
      const filter = {
        from: '2026-03-02T00:00:00.000Z',
        to: '2026-03-02T23:59:59.000Z',
      };

      const masterEventA = getTask({
        id: 9202,
        userId,
        name: 'Recurring task A',
        description: 'repeat A',
        priority: 2,
        weight: 4,
        startDate: '2026-03-02T10:15:00.000Z',
        deadline: '2026-03-02T12:00:00.000Z',
        recurrence: {
          start: '2026-03-02T10:15:00.000Z',
          end: '2026-03-02T23:59:59.000Z',
          frequency: RecurrenceFrequency.DAILY,
        },
      });

      const masterEventB = getTask({
        id: 9203,
        userId,
        name: 'Recurring task B',
        description: 'repeat B',
        priority: 3,
        weight: 5,
        startDate: '2026-03-02T10:15:00.000Z',
        deadline: '2026-03-02T12:00:00.000Z',
        recurrence: {
          start: '2026-03-02T10:15:00.000Z',
          end: '2026-03-02T23:59:59.000Z',
          frequency: RecurrenceFrequency.DAILY,
        },
      });

      const occurrenceStart = '2026-03-02T10:15:00.000Z';

      const overrideForA = TaskOverride.restore({
        task: getTask({
          id: 9302,
          userId,
          name: 'Override for A',
          description: 'override A',
          priority: 1,
          weight: 7,
          startDate: '2026-03-02T08:45:00.000Z',
          deadline: '2026-03-02T11:30:00.000Z',
          status: TaskStatus.IN_PROGRESS,
        }),
        masterTaskId: masterEventA.id,
        occurrenceStart,
        type: TaskOverrideType.OVERRIDE,
      });

      const overrideForB = TaskOverride.restore({
        task: getTask({
          id: 9303,
          userId,
          name: 'Override for B',
          description: 'override B',
          priority: 4,
          weight: 9,
          startDate: '2026-03-02T16:20:00.000Z',
          deadline: '2026-03-02T17:00:00.000Z',
          status: TaskStatus.IN_PROGRESS,
        }),
        masterTaskId: masterEventB.id,
        occurrenceStart,
        type: TaskOverrideType.OVERRIDE,
      });

      tasksOverridesWriteRepoMock.getManyMasterEvents.mockResolvedValueOnce([masterEventA, masterEventB]);
      tasksOverridesWriteRepoMock.getManyOverrides.mockResolvedValueOnce([overrideForB, overrideForA]);
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
      expect(res.data.items[0]).toMatchObject({
        id: TaskIdBuilder.wrapOverrideId({
          masterTaskId: masterEventA.id,
          overrideId: overrideForA.id,
          timestamp: new Date(occurrenceStart).getTime(),
        }),
        userId,
        name: 'Override for A',
        description: 'override A',
        priority: 1,
        weight: 7,
        startDate: '2026-03-02T08:45:00.000Z',
      });
      expect(res.data.items[1]).toMatchObject({
        id: TaskIdBuilder.wrapOverrideId({
          masterTaskId: masterEventB.id,
          overrideId: overrideForB.id,
          timestamp: new Date(occurrenceStart).getTime(),
        }),
        userId,
        name: 'Override for B',
        description: 'override B',
        priority: 4,
        weight: 9,
        startDate: '2026-03-02T16:20:00.000Z',
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

      tasksOverridesWriteRepoMock.getManyMasterEvents.mockResolvedValueOnce([]);
      tasksOverridesWriteRepoMock.getManyOverrides.mockResolvedValueOnce([]);
      tasksReadRepoMock.getByRange.mockResolvedValueOnce([]);

      const res = await sendMessage<GoalGetDiaryTasks.Response, GoalGetDiaryTasks.Request>(
        GoalGetDiaryTasks.pattern,
        payload,
      );

      expect(tasksOverridesWriteRepoMock.getManyMasterEvents).toHaveBeenCalledTimes(1);
      expect(tasksOverridesWriteRepoMock.getManyOverrides).toHaveBeenCalledTimes(1);
      expect(tasksReadRepoMock.getByRange).toHaveBeenCalledTimes(1);
      expect(res).toEqual({
        data: {
          items: [],
        },
      });
    });

    test('should return weekly virtual tasks only for Wednesday, Friday and Saturday', async () => {
      const userId = 888;

      const masterEvent = getTask({
        id: 9401,
        userId,
        startDate: '2026-03-01T10:00:00.000Z',
        recurrence: {
          start: '2026-03-01T10:00:00.000Z',
          end: '2026-03-31T10:00:00.000Z',
          frequency: RecurrenceFrequency.WEEKLY,
          weekdays: [TaskRecurrenceWeekday.WE, TaskRecurrenceWeekday.FR, TaskRecurrenceWeekday.SA],
        },
      });

      tasksOverridesWriteRepoMock.getManyMasterEvents.mockResolvedValueOnce([masterEvent]);
      tasksOverridesWriteRepoMock.getManyOverrides.mockResolvedValueOnce([]);
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

      const masterEvent = getTask({
        id: 9402,
        userId,
        startDate: '2026-03-01T03:00:00.000Z',
        recurrence: {
          start: '2026-03-01T03:00:00.000Z',
          end: '2026-03-31T03:00:00.000Z',
          frequency: RecurrenceFrequency.WEEKLY,
          weekdays: [TaskRecurrenceWeekday.WE, TaskRecurrenceWeekday.FR, TaskRecurrenceWeekday.SA],
        },
      });

      tasksOverridesWriteRepoMock.getManyMasterEvents.mockResolvedValueOnce([masterEvent]);
      tasksOverridesWriteRepoMock.getManyOverrides.mockResolvedValueOnce([]);
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
