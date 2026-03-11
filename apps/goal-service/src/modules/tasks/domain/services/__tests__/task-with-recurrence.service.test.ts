import {
  RecurrenceFrequency,
  TaskOverrideType,
  TaskRecurrenceStatus,
  TaskRecurrenceWeekday,
  TaskStatus,
} from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { Task, TaskOverride, TaskRecurrence } from '../../aggregates/task';
import { Priority, Weight } from '../../aggregates/task/value-objects';
import { TaskWithRecurrenceService } from '../task-with-recurrence.service';

const buildPatternShaper =
  (pattern = 'RRULE:FREQ=DAILY') =>
  () =>
    pattern;

function buildTask(input: { id?: number; startDate?: string; deadline?: string; status?: TaskStatus } = {}): Task {
  return Task.restore({
    id: input.id ?? 11,
    userId: 77,
    name: Name.create('Task'),
    description: 'desc',
    priority: Priority.create(1),
    weight: Weight.create(1),
    startDate: input.startDate != null ? DateVo.create(input.startDate) : undefined,
    deadline: input.deadline != null ? DateVo.create(input.deadline) : undefined,
    endDate: undefined,
    status: input.status ?? (input.startDate != null ? TaskStatus.IN_PROGRESS : TaskStatus.NOT_STARTED),
  });
}

function buildRecurrence(input: { startDate: string; timezone?: string } = { startDate: '2023-01-01T15:00:00.000Z' }): {
  startDate: string;
  timezone: string;
  pattern: string;
  frequency: RecurrenceFrequency;
  weekstart: TaskRecurrenceWeekday;
} {
  return {
    startDate: input.startDate,
    timezone: input.timezone ?? 'Asia/Novosibirsk',
    pattern: 'RRULE:FREQ=DAILY',
    frequency: RecurrenceFrequency.DAILY,
    weekstart: TaskRecurrenceWeekday.MO,
  };
}

function buildStoredRecurrence(input: { startDate: string; timezone?: string }): TaskRecurrence {
  return TaskRecurrence.restore({
    id: 19,
    userId: 77,
    taskId: 11,
    status: TaskRecurrenceStatus.ACTIVE,
    timezone: input.timezone ?? 'Asia/Novosibirsk',
    startDate: DateVo.create(input.startDate),
    pattern: 'RRULE:FREQ=DAILY',
    frequency: RecurrenceFrequency.DAILY,
    weekstart: TaskRecurrenceWeekday.MO,
  });
}

function buildOverride(input: {
  id?: number;
  status: TaskStatus;
  recurrenceId?: number;
  deadline?: string;
}): TaskOverride {
  return TaskOverride.restore({
    task: buildTask({
      id: input.id ?? 31,
      startDate: '2023-01-03T05:00:00.000Z',
      deadline: input.deadline,
      status: input.status,
    }),
    recurrenceId: input.recurrenceId ?? 19,
    recurrenceStart: DateVo.create('2023-01-03T12:00:00.000Z'),
    type: TaskOverrideType.OVERRIDE,
  });
}

describe('TaskWithRecurrenceService', () => {
  const service = new TaskWithRecurrenceService();

  it('forbids recurrence for virtual tasks', () => {
    expect(() =>
      service.ensureNotRepeatable({
        type: 'virtual',
        taskId: 'v::12::2023-01-01T00:00:00.000Z',
        recurrence: buildRecurrence(),
      }),
    ).toThrow();
  });

  it('allows virtual and override tasks without recurrence', () => {
    expect(() =>
      service.ensureNotRepeatable({
        type: 'virtual',
      }),
    ).not.toThrow();

    expect(() =>
      service.ensureNotRepeatable({
        type: 'override',
      }),
    ).not.toThrow();
  });

  it('creates recurrence when task startDate is in the same timezone day', () => {
    const result = service.create({
      task: buildTask(),
      taskPatch: {
        name: 'Task',
        description: 'desc',
        priority: 1,
        weight: 1,
        startDate: '2023-01-01T01:00:00.000Z',
      },
      recurrence: buildRecurrence({ startDate: '2023-01-01T15:00:00.000Z' }),
    });

    expect(result.task.startDate).toBe('2023-01-01T01:00:00.000Z');
    expect(result.recurrence.taskId).toBe(11);
    expect(result.recurrence.startDate).toBe('2023-01-01T15:00:00.000Z');
    expect(result.recurrence.status).toBe(TaskRecurrenceStatus.ACTIVE);
  });

  it('requires task startDate when recurrence is present', () => {
    expect(() =>
      service.create({
        task: buildTask(),
        taskPatch: {
          name: 'Task',
          description: 'desc',
          priority: 1,
          weight: 1,
        },
        recurrence: buildRecurrence(),
      }),
    ).toThrow();
  });

  it('rejects different local days for task and recurrence startDate', () => {
    expect(() =>
      service.create({
        task: buildTask(),
        taskPatch: {
          name: 'Task',
          description: 'desc',
          priority: 1,
          weight: 1,
          startDate: '2023-01-01T01:00:00.000Z',
        },
        recurrence: buildRecurrence({ startDate: '2023-01-01T20:00:00.000Z' }),
      }),
    ).toThrow();
  });

  it('updates task and recurrence using current recurrence timezone', () => {
    const result = service.update({
      task: buildTask({ startDate: '2023-01-01T01:00:00.000Z' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-01T05:00:00.000Z',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-01T15:00:00.000Z' }),
      recurrencePatch: {
        ...buildRecurrence({
          startDate: '2023-01-01T13:00:00.000Z',
          timezone: 'UTC',
        }),
        pattern: 'RRULE:FREQ=WEEKLY',
        frequency: RecurrenceFrequency.WEEKLY,
      },
    });

    expect(result.task.startDate).toBe('2023-01-01T05:00:00.000Z');
    expect(result.recurrence.timezone).toBe('Asia/Novosibirsk');
    expect(result.recurrence.pattern).toBe('RRULE:FREQ=WEEKLY');
  });

  it('replace marks recurrence create status', () => {
    const result = service.replace({
      task: buildTask({ startDate: '2023-01-01T01:00:00.000Z' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-01T05:00:00.000Z',
      },
      currentRecurrence: undefined,
      recurrencePatch: {
        startDate: '2023-01-01T13:00:00.000Z',
        timezone: 'Asia/Novosibirsk',
        frequency: RecurrenceFrequency.DAILY,
        weekstart: TaskRecurrenceWeekday.MO,
      },
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
    });

    expect(result.isCreate).toBe(true);
    expect(result.isUpdate).toBeUndefined();
    expect(result.isCancel).toBeUndefined();
    expect(result.recurrence?.taskId).toBe(11);
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.ACTIVE);
  });

  it('replace rejects overrides that do not belong to current recurrence', () => {
    expect(() =>
      service.replace({
        task: buildTask({ startDate: '2023-01-01T01:00:00.000Z' }),
        taskPatch: {
          name: 'Updated task',
          description: 'new desc',
          priority: 2,
          weight: 3,
        },
        currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-03T12:00:00.000Z' }),
        currentOverrides: [buildOverride({ recurrenceId: 999, status: TaskStatus.IN_PROGRESS })],
        recurrencePatch: undefined,
        patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
      }),
    ).toThrow();
  });

  it('replace marks recurrence update status', () => {
    const result = service.replace({
      task: buildTask({ startDate: '2023-01-01T01:00:00.000Z' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-01T05:00:00.000Z',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-01T15:00:00.000Z' }),
      recurrencePatch: {
        startDate: '2023-01-01T13:00:00.000Z',
        timezone: 'UTC',
        frequency: RecurrenceFrequency.WEEKLY,
        weekstart: TaskRecurrenceWeekday.MO,
      },
      patternShaper: buildPatternShaper('RRULE:FREQ=WEEKLY'),
    });

    expect(result.isCreate).toBeUndefined();
    expect(result.isUpdate).toBe(true);
    expect(result.isCancel).toBeUndefined();
    expect(result.recurrence?.pattern).toBe('RRULE:FREQ=WEEKLY');
    expect(result.recurrence?.timezone).toBe('Asia/Novosibirsk');
  });

  it('replace marks recurrence deletion when there are no overrides', () => {
    const result = service.replace({
      task: buildTask({ startDate: '2023-01-03T01:00:00.000Z' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-03T05:00:00.000Z',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-03T12:00:00.000Z' }),
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
    });

    expect(result.isCreate).toBeUndefined();
    expect(result.isUpdate).toBeUndefined();
    expect(result.isCancel).toBe(true);
    const deleteByEmptyRecurrence = result.recurrence;
    expect(deleteByEmptyRecurrence).not.toBeNull();
    if (deleteByEmptyRecurrence == null) {
      throw new Error('recurrence should be defined');
    }
    expect(deleteByEmptyRecurrence.id).toBe(19);
    expect(result.shouldDeleteRecurrence).toBe(true);
    expect(result.overridesToDelete).toEqual([]);
  });

  it('replace deletes recurrence with all cancellable overrides', () => {
    const result = service.replace({
      task: buildTask({ startDate: '2023-01-03T01:00:00.000Z' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-03T12:00:00.000Z' }),
      currentOverrides: [
        buildOverride({ id: 101, status: TaskStatus.NOT_STARTED }),
        buildOverride({ id: 102, status: TaskStatus.IN_PROGRESS }),
        buildOverride({ id: 103, status: TaskStatus.ARCHIVED }),
      ],
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
    });

    expect(result.isCancel).toBe(true);
    expect(result.isCreate).toBeUndefined();
    expect(result.isUpdate).toBeUndefined();
    const deleteByOverridesRecurrence = result.recurrence;
    expect(deleteByOverridesRecurrence).not.toBeNull();
    if (deleteByOverridesRecurrence == null) {
      throw new Error('recurrence should be defined');
    }
    expect(deleteByOverridesRecurrence.id).toBe(19);
    expect(result.shouldDeleteRecurrence).toBe(true);
    expect(result.overridesToDelete).toEqual([]);
  });

  it('replace cancels recurrence without deletion when there is non-cancellable override', () => {
    const result = service.replace({
      task: buildTask({ startDate: '2023-01-03T01:00:00.000Z' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-03T05:00:00.000Z',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-01T12:00:00.000Z' }),
      currentOverrides: [
        buildOverride({
          status: TaskStatus.COMPLETED,
          deadline: '2023-01-05T12:00:00.000Z',
        }),
        buildOverride({
          id: 32,
          status: TaskStatus.COMPLETED,
          deadline: '2023-01-07T18:00:00.000Z',
        }),
      ],
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
    });

    expect(result.isCancel).toBe(true);
    expect(result.isCreate).toBeUndefined();
    expect(result.isUpdate).toBeUndefined();
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.CANCELED);
    expect(result.recurrence?.untilDate).toBe('2023-01-07T18:00:00.000Z');
    expect(result.recurrence).not.toBeNull();
    expect(result.shouldDeleteRecurrence).toBe(false);
    expect(result.overridesToDelete).toEqual([]);
  });

  it('replace deletes only target overrides when recurrence is canceled', () => {
    const deletableA = buildOverride({
      id: 101,
      status: TaskStatus.NOT_STARTED,
      deadline: '2023-01-05T12:00:00.000Z',
    });
    const keep = buildOverride({
      id: 102,
      status: TaskStatus.COMPLETED,
      deadline: '2023-01-07T18:00:00.000Z',
    });
    const deletableB = buildOverride({
      id: 103,
      status: TaskStatus.ARCHIVED,
      deadline: '2023-01-06T09:00:00.000Z',
    });

    const result = service.replace({
      task: buildTask({ startDate: '2023-01-03T01:00:00.000Z' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-03T05:00:00.000Z',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-01T12:00:00.000Z' }),
      currentOverrides: [deletableA, keep, deletableB],
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230107T180000Z'),
    });

    expect(result.isCancel).toBe(true);
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.CANCELED);
    expect(result.recurrence?.untilDate).toBe('2023-01-07T18:00:00.000Z');
    expect(result.shouldDeleteRecurrence).toBe(false);
    expect(result.overridesToDelete).toEqual([deletableA, deletableB]);
  });

  it('replace cancels recurrence without task.startDate when recurrence cannot be deleted', () => {
    const result = service.replace({
      task: buildTask(),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-03T12:00:00.000Z' }),
      currentOverrides: [
        buildOverride({
          status: TaskStatus.COMPLETED,
          deadline: '2023-01-05T12:00:00.000Z',
        }),
      ],
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
    });

    expect(result.isCancel).toBe(true);
    expect(result.task.startDate).toBeUndefined();
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.CANCELED);
    expect(result.recurrence?.untilDate).toBe('2023-01-05T12:00:00.000Z');
    expect(result.shouldDeleteRecurrence).toBe(false);
    expect(result.overridesToDelete).toEqual([]);
  });

  it('replace marks no recurrence change when patches are absent', () => {
    const result = service.replace({
      task: buildTask({ startDate: '2023-01-01T01:00:00.000Z' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-01T05:00:00.000Z',
      },
      currentRecurrence: undefined,
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
    });

    expect(result.isCreate).toBeUndefined();
    expect(result.isUpdate).toBeUndefined();
    expect(result.isCancel).toBeUndefined();
    expect(result.task.startDate).toBe('2023-01-01T05:00:00.000Z');
    expect(result.recurrence).toBeNull();
  });

  it('cancels recurrence and keeps it when it is still non-empty', () => {
    const result = service.cancel({
      task: buildTask({ startDate: '2023-01-01T01:00:00.000Z' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-01T05:00:00.000Z',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-01T00:00:00.000Z' }),
      currentOverrides: [
        buildOverride({
          status: TaskStatus.COMPLETED,
          deadline: '2023-01-02T10:00:00.000Z',
        }),
        buildOverride({
          id: 32,
          status: TaskStatus.COMPLETED,
          deadline: '2023-01-04T16:30:00.000Z',
        }),
      ],
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230104T163000Z'),
    });

    expect(result.task.startDate).toBe('2023-01-01T05:00:00.000Z');
    expect(result.recurrence?.untilDate).toBe('2023-01-04T16:30:00.000Z');
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.CANCELED);
    expect(result.shouldDeleteRecurrence).toBe(false);
    expect(result.overridesToDelete).toEqual([]);
  });

  it('deletes recurrence on cancel when all overrides are cancellable', () => {
    const result = service.cancel({
      task: buildTask({ startDate: '2023-01-03T01:00:00.000Z' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-03T05:00:00.000Z',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-03T12:00:00.000Z' }),
      currentOverrides: [
        buildOverride({
          status: TaskStatus.NOT_STARTED,
          deadline: '2023-01-04T10:00:00.000Z',
        }),
        buildOverride({
          id: 32,
          status: TaskStatus.ARCHIVED,
          deadline: '2023-01-05T10:00:00.000Z',
        }),
      ],
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
    });

    expect(result.recurrence.id).toBe(19);
    expect(result.shouldDeleteRecurrence).toBe(true);
    expect(result.overridesToDelete).toEqual([]);
  });

  it('uses patched task.startDate when canceling recurrence without deletion', () => {
    const result = service.cancel({
      task: buildTask(),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-01T05:00:00.000Z',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-01T00:00:00.000Z' }),
      currentOverrides: [
        buildOverride({
          status: TaskStatus.COMPLETED,
          deadline: '2023-01-02T10:00:00.000Z',
        }),
      ],
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
    });

    expect(result.task.startDate).toBe('2023-01-01T05:00:00.000Z');
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.CANCELED);
    expect(result.recurrence?.untilDate).toBe('2023-01-02T10:00:00.000Z');
    expect(result.shouldDeleteRecurrence).toBe(false);
    expect(result.overridesToDelete).toEqual([]);
  });
});
