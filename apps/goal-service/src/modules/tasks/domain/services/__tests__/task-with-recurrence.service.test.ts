import {
  RecurrenceFrequency,
  TaskOverrideType,
  TaskRecurrenceStatus,
  TaskRecurrenceWeekday,
  TaskStatus,
} from '@big-d/api-contracts';
import { DateVo, Name, TimezoneVo } from '@big-d/api-utils';
import { Task, TaskOverride, TaskRecurrence } from '../../aggregates/task';
import { Priority, Weight } from '../../aggregates/task/value-objects';
import { TaskWithRecurrenceService } from '../task-with-recurrence.service';

const buildPatternShaper =
  (pattern = 'RRULE:FREQ=DAILY') =>
  () =>
    pattern;

function buildTask(
  input: {
    id?: number;
    recurrenceId?: number;
    startDate?: string;
    deadline?: string;
    endDate?: string;
    cancelReason?: string;
    status?: TaskStatus;
  } = {},
): Task {
  return Task.restore({
    id: input.id ?? 11,
    userId: 77,
    name: Name.create('Task'),
    description: 'desc',
    priority: Priority.create(1),
    weight: Weight.create(1),
    cancelReason: input.cancelReason,
    startDate: input.startDate != null ? DateVo.restore(input.startDate) : undefined,
    deadline: input.deadline != null ? DateVo.restore(input.deadline) : undefined,
    endDate: input.endDate != null ? DateVo.restore(input.endDate) : undefined,
    status: input.status ?? (input.startDate != null ? TaskStatus.IN_PROGRESS : TaskStatus.NOT_STARTED),
    recurrenceId: input.recurrenceId,
  });
}

function buildRecurrence(input: { startDate: string; timezone?: string } = { startDate: '2023-01-01T15:00' }): {
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

function buildStoredRecurrence(input: { id?: number; startDate: string; timezone?: string }): TaskRecurrence {
  return TaskRecurrence.restore({
    id: input?.id ?? 19,
    userId: 77,
    taskId: 11,
    status: TaskRecurrenceStatus.ACTIVE,
    timezone: TimezoneVo.create(input.timezone ?? 'Asia/Novosibirsk'),
    startDate: DateVo.restore(input.startDate),
    pattern: 'RRULE:FREQ=DAILY',
    frequency: RecurrenceFrequency.DAILY,
    weekstart: TaskRecurrenceWeekday.MO,
  });
}

function buildCanceledRecurrence(input: { id?: number; startDate: string; timezone?: string }): TaskRecurrence {
  return TaskRecurrence.restore({
    id: input?.id ?? 19,
    userId: 77,
    taskId: 11,
    status: TaskRecurrenceStatus.CANCELED,
    timezone: TimezoneVo.create(input.timezone ?? 'Asia/Novosibirsk'),
    startDate: DateVo.restore(input.startDate),
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
  recurrenceStart?: string;
  startDate?: string;
  endDate?: string;
  cancelReason?: string;
}): TaskOverride {
  return TaskOverride.restore({
    task: buildTask({
      id: input.id ?? 31,
      startDate: input.startDate ?? '2023-01-03T05:00',
      deadline: input.deadline,
      endDate: input.endDate,
      cancelReason: input.cancelReason,
      status: input.status,
    }),
    recurrenceId: input.recurrenceId ?? 19,
    recurrenceStart: DateVo.restore(input.recurrenceStart ?? '2023-01-03T12:00'),
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
      task: buildTask({ startDate: '2023-01-01T01:00' }),
      recurrenceData: {
        startDate: '2023-01-01T15:00',
        timezone: 'Asia/Novosibirsk',
        frequency: RecurrenceFrequency.DAILY,
        weekstart: TaskRecurrenceWeekday.MO,
      },
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
    });

    expect(result.draftRecurrence.taskId).toBe(11);
    expect(result.draftRecurrence.startDate).toBe('2023-01-01T15:00');
    expect(result.draftRecurrence.status).toBe(TaskRecurrenceStatus.ACTIVE);
  });

  it('requires task startDate when recurrence is present', () => {
    expect(() =>
      service.replace({
        task: buildTask(),
        taskPatch: {
          name: 'Task',
          description: 'desc',
          priority: 1,
          weight: 1,
        },
        currentRecurrence: undefined,
        recurrencePatch: {
          startDate: '2023-01-01T15:00',
          timezone: 'Asia/Novosibirsk',
          frequency: RecurrenceFrequency.DAILY,
          weekstart: TaskRecurrenceWeekday.MO,
        },
        patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
      }),
    ).toThrow();
  });

  it('requires task deadline when recurrence is present', () => {
    expect(() =>
      service.replace({
        task: buildTask({ startDate: '2023-01-01T01:00' }),
        taskPatch: {
          name: 'Task',
          description: 'desc',
          priority: 1,
          weight: 1,
        },
        currentRecurrence: undefined,
        recurrencePatch: {
          startDate: '2023-01-01T15:00',
          timezone: 'Asia/Novosibirsk',
          frequency: RecurrenceFrequency.DAILY,
          weekstart: TaskRecurrenceWeekday.MO,
        },
        patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
      }),
    ).toThrow();
  });

  it('rejects finishing repeatable task directly', () => {
    expect(() =>
      service.finish({
        task: buildTask({
          recurrenceId: 19,
          startDate: '2023-01-01T01:00',
          deadline: '2023-01-01T05:00',
          status: TaskStatus.IN_PROGRESS,
        }),
        timezone: 'UTC',
      }),
    ).toThrow();
  });

  it('rejects soft deleting repeatable task directly', () => {
    expect(() =>
      service.softDelete({
        task: buildTask({
          recurrenceId: 19,
          startDate: '2023-01-01T01:00',
          deadline: '2023-01-01T05:00',
          status: TaskStatus.IN_PROGRESS,
        }),
      }),
    ).toThrow();
  });

  it('rejects complete deleting repeatable task directly', () => {
    expect(() =>
      service.deleteComplete({
        task: buildTask({
          recurrenceId: 19,
          startDate: '2023-01-01T01:00',
          deadline: '2023-01-01T05:00',
          status: TaskStatus.DELETED,
        }),
      }),
    ).toThrow();
  });

  it('rejects different local days for task and recurrence startDate', () => {
    expect(() =>
      service.replace({
        task: buildTask(),
        taskPatch: {
          name: 'Task',
          description: 'desc',
          priority: 1,
          weight: 1,
          startDate: '2023-01-01T01:00',
        },
        currentRecurrence: undefined,
        recurrencePatch: {
          startDate: '2023-01-02T00:20',
          timezone: 'Asia/Novosibirsk',
          frequency: RecurrenceFrequency.DAILY,
          weekstart: TaskRecurrenceWeekday.MO,
        },
        patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
      }),
    ).toThrow();
  });

  it('replace marks recurrence create status', () => {
    const result = service.replace({
      task: buildTask({ startDate: '2023-01-01T01:00' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-01T05:00',
      },
      currentRecurrence: undefined,
      recurrencePatch: {
        startDate: '2023-01-01T13:00',
        timezone: 'Asia/Novosibirsk',
        frequency: RecurrenceFrequency.DAILY,
        weekstart: TaskRecurrenceWeekday.MO,
      },
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
    });

    expect(result.isRecurrenceCreate).toBe(true);
    expect(result.isRecurrenceUpdate).toBeUndefined();
    expect(result.isRecurrenceCancel).toBeUndefined();
    expect(result.recurrence?.taskId).toBe(11);
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.ACTIVE);
  });

  it('replace updates recurrenceStart for all currentOverrides when canceled recurrence is recreated', () => {
    const firstOverride = buildOverride({
      id: 31,
      status: TaskStatus.COMPLETED,
      recurrenceId: 19,
      recurrenceStart: '2023-01-03T12:00',
      startDate: '2023-01-03T05:00',
      deadline: '2023-01-03T12:00',
      endDate: '2023-01-03T09:00',
    });
    const secondOverride = buildOverride({
      id: 32,
      status: TaskStatus.IN_PROGRESS,
      recurrenceId: 19,
      recurrenceStart: '2023-01-05T12:00',
      startDate: '2023-01-05T05:00',
      deadline: '2023-01-05T12:00',
    });

    const result = service.replace({
      task: buildTask({ recurrenceId: 19, startDate: '2023-01-01T01:00', deadline: '2023-01-01T08:00' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-01T05:00',
        deadline: '2023-01-01T08:00',
      },
      currentRecurrence: buildCanceledRecurrence({ id: 19, startDate: '2023-01-01T12:00' }),
      currentOverrides: [firstOverride, secondOverride],
      recurrencePatch: {
        startDate: '2023-01-01T13:45',
        timezone: 'Asia/Novosibirsk',
        frequency: RecurrenceFrequency.DAILY,
        weekstart: TaskRecurrenceWeekday.MO,
      },
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
    });

    expect(result.isRecurrenceUpdate).toBe(true);
    if (!result.isRecurrenceUpdate) throw new Error('result should be recurrence update');
    expect(result.overridesToUpdate).toHaveLength(2);
    expect(result.overridesToUpdate.map((override) => override.recurrenceStart)).toEqual([
      '2023-01-03T13:45',
      '2023-01-05T13:45',
    ]);
    expect(result.overridesToUpdate[0]?.endDate).toBe('2023-01-03T09:00');
    expect(result.overridesToUpdate[0]?.deadline).toBe('2023-01-03T12:00');
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.ACTIVE);
  });

  it('replace rejects overrides that do not belong to current recurrence', () => {
    expect(() =>
      service.replace({
        task: buildTask({ startDate: '2023-01-01T01:00' }),
        taskPatch: {
          name: 'Updated task',
          description: 'new desc',
          priority: 2,
          weight: 3,
        },
        currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-03T12:00' }),
        currentOverrides: [buildOverride({ recurrenceId: 999, status: TaskStatus.IN_PROGRESS })],
        recurrencePatch: undefined,
        patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
      }),
    ).toThrow();
  });

  it('replace marks recurrence update status', () => {
    const result = service.replace({
      task: buildTask({ startDate: '2023-01-01T01:00' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-01T05:00',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-01T15:00' }),
      recurrencePatch: {
        startDate: '2023-01-01T13:00',
        timezone: 'UTC',
        frequency: RecurrenceFrequency.WEEKLY,
        weekstart: TaskRecurrenceWeekday.MO,
        weekdays: [TaskRecurrenceWeekday.MO],
      },
      patternShaper: buildPatternShaper('RRULE:FREQ=WEEKLY'),
    });

    expect(result.isRecurrenceCreate).toBeUndefined();
    expect(result.isRecurrenceUpdate).toBe(true);
    expect(result.isRecurrenceCancel).toBeUndefined();
    expect(result.recurrence?.pattern).toBe('RRULE:FREQ=WEEKLY');
    expect(result.recurrence?.timezone).toBe('Asia/Novosibirsk');
  });

  it('replace updates recurrenceStart for all currentOverrides when recurrence startDate changes', () => {
    const firstOverride = buildOverride({
      id: 41,
      status: TaskStatus.COMPLETED,
      recurrenceId: 19,
      recurrenceStart: '2023-01-03T12:00',
      startDate: '2023-01-03T05:00',
      deadline: '2023-01-03T12:00',
      endDate: '2023-01-03T09:00',
    });
    const secondOverride = buildOverride({
      id: 42,
      status: TaskStatus.ARCHIVED,
      recurrenceId: 19,
      recurrenceStart: '2023-01-06T12:00',
      startDate: '2023-01-06T05:00',
      deadline: '2023-01-06T12:00',
    });

    const result = service.replace({
      task: buildTask({ recurrenceId: 19, startDate: '2023-01-01T01:00', deadline: '2023-01-01T05:00' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-01T05:00',
        deadline: '2023-01-01T10:00',
      },
      currentRecurrence: buildStoredRecurrence({ id: 19, startDate: '2023-01-01T12:00' }),
      currentOverrides: [firstOverride, secondOverride],
      recurrencePatch: {
        startDate: '2023-01-01T16:20',
        timezone: 'UTC',
        frequency: RecurrenceFrequency.DAILY,
        weekstart: TaskRecurrenceWeekday.MO,
      },
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
    });

    expect(result.isRecurrenceUpdate).toBe(true);
    if (!result.isRecurrenceUpdate) throw new Error('result should be recurrence update');
    expect(result.overridesToUpdate).toHaveLength(2);
    expect(result.overridesToUpdate.map((override) => override.recurrenceStart)).toEqual([
      '2023-01-03T16:20',
      '2023-01-06T16:20',
    ]);
    expect(result.overridesToUpdate[0]?.endDate).toBe('2023-01-03T09:00');
    expect(result.overridesToUpdate[1]?.type).toBe(TaskOverrideType.OVERRIDE);
  });

  it('replace marks recurrence deletion when there are no overrides', () => {
    const result = service.replace({
      task: buildTask({ recurrenceId: 19, startDate: '2023-01-03T01:00' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-03T05:00',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-03T12:00' }),
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
    });

    expect(result.isRecurrenceCreate).toBeUndefined();
    expect(result.isRecurrenceUpdate).toBeUndefined();
    expect(result.isRecurrenceCancel).toBe(true);
    const deleteByEmptyRecurrence = result.recurrence;
    expect(deleteByEmptyRecurrence).not.toBeNull();
    if (deleteByEmptyRecurrence == null) {
      throw new Error('recurrence should be defined');
    }
    expect(deleteByEmptyRecurrence.id).toBe(19);
    expect(result.shouldDeleteRecurrence).toBe(true);
    expect(result.isRecurrenceCancel).toBe(true);
    if (!result.isRecurrenceCancel) throw new Error('result should be recurrence cancel');
    expect(result.overridesToDelete).toEqual([]);
  });

  it('replace deletes recurrence with all cancellable overrides', () => {
    const recurrenceId = 333;
    const result = service.replace({
      task: buildTask({ recurrenceId, startDate: '2023-01-03T01:00' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
      },
      currentRecurrence: buildStoredRecurrence({ id: recurrenceId, startDate: '2023-01-03T12:00' }),
      currentOverrides: [
        buildOverride({ id: 99, status: TaskStatus.COMPLETED, recurrenceId, deadline: '2023-01-04T01:00' }),
        buildOverride({ id: 100, status: TaskStatus.OVERDUE, recurrenceId, deadline: '2023-01-04T01:00' }),

        buildOverride({ id: 101, status: TaskStatus.NOT_STARTED, recurrenceId, deadline: '2023-01-04T01:00' }),
        buildOverride({ id: 102, status: TaskStatus.IN_PROGRESS, recurrenceId, deadline: '2023-01-04T01:00' }),
        buildOverride({ id: 103, status: TaskStatus.ARCHIVED, recurrenceId, deadline: '2023-01-04T01:00' }),
      ],
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
    });

    expect(result.isRecurrenceCancel).toBe(true);
    expect(result.isRecurrenceCreate).toBeUndefined();
    expect(result.isRecurrenceUpdate).toBeUndefined();
    const deleteByOverridesRecurrence = result.recurrence;
    expect(deleteByOverridesRecurrence).not.toBeNull();
    if (deleteByOverridesRecurrence == null) {
      throw new Error('recurrence should be defined');
    }
    expect(deleteByOverridesRecurrence.id).toBe(recurrenceId);
    expect(result.shouldDeleteRecurrence).toBe(false);
    expect(result.isRecurrenceCancel).toBe(true);
    if (!result.isRecurrenceCancel) throw new Error('result should be recurrence cancel');
    expect(result.overridesToDelete?.length).toEqual(3);
  });

  it('replace cancels recurrence without deletion when there is non-cancellable override', () => {
    const result = service.replace({
      task: buildTask({ recurrenceId: 19, startDate: '2023-01-03T01:00' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-03T05:00',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-01T12:00:00.000Z' }),
      currentOverrides: [
        buildOverride({
          status: TaskStatus.COMPLETED,
          deadline: '2023-01-05T12:00',
        }),
        buildOverride({
          id: 32,
          status: TaskStatus.COMPLETED,
          deadline: '2023-01-07T18:00',
        }),
      ],
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
    });

    expect(result.isRecurrenceCancel).toBe(true);
    expect(result.isRecurrenceCreate).toBeUndefined();
    expect(result.isRecurrenceUpdate).toBeUndefined();
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.CANCELED);
    expect(result.recurrence?.untilDate).toBe('2023-01-05T12:00');
    expect(result.recurrence).not.toBeNull();
    expect(result.shouldDeleteRecurrence).toBe(false);
    expect(result.isRecurrenceCancel).toBe(true);
    if (!result.isRecurrenceCancel) throw new Error('result should be recurrence cancel');
    expect(result.overridesToDelete).toEqual([]);
  });

  it('replace deletes only target overrides when recurrence is canceled', () => {
    const deletableA = buildOverride({
      id: 101,
      status: TaskStatus.NOT_STARTED,
      deadline: '2023-01-05T12:00',
    });
    const keep = buildOverride({
      id: 102,
      status: TaskStatus.COMPLETED,
      deadline: '2023-01-07T18:00',
    });
    const deletableB = buildOverride({
      id: 103,
      status: TaskStatus.ARCHIVED,
      deadline: '2023-01-06T09:00',
    });

    const result = service.replace({
      task: buildTask({ recurrenceId: 19, startDate: '2023-01-03T01:00' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-03T05:00',
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-01T12:00:00.000Z' }),
      currentOverrides: [deletableA, keep, deletableB],
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230107T180000Z'),
    });

    expect(result.isRecurrenceCancel).toBe(true);
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.CANCELED);
    expect(result.recurrence?.untilDate).toBe('2023-01-05T12:00');
    expect(result.shouldDeleteRecurrence).toBe(false);
    expect(result.isRecurrenceCancel).toBe(true);
    if (!result.isRecurrenceCancel) throw new Error('result should be recurrence cancel');
    expect(result.overridesToDelete).toEqual([deletableA, deletableB]);
  });

  it('replace cancels recurrence without task.startDate when recurrence cannot be deleted', () => {
    const result = service.replace({
      task: buildTask({ recurrenceId: 19 }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
      },
      currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-03T12:00' }),
      currentOverrides: [
        buildOverride({
          status: TaskStatus.COMPLETED,
          deadline: '2023-01-05T12:00',
        }),
      ],
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
    });

    expect(result.isRecurrenceCancel).toBe(true);
    expect(result.task.startDate).toBeUndefined();
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.CANCELED);
    expect(result.recurrence?.untilDate).toBe('2023-01-05T12:00');
    expect(result.shouldDeleteRecurrence).toBe(false);
    expect(result.isRecurrenceCancel).toBe(true);
    if (!result.isRecurrenceCancel) throw new Error('result should be recurrence cancel');
    expect(result.overridesToDelete).toEqual([]);
  });

  it('replace marks no recurrence change when patches are absent', () => {
    const result = service.replace({
      task: buildTask({ startDate: '2023-01-01T01:00' }),
      taskPatch: {
        name: 'Updated task',
        description: 'new desc',
        priority: 2,
        weight: 3,
        startDate: '2023-01-01T05:00',
      },
      currentRecurrence: undefined,
      recurrencePatch: undefined,
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY'),
    });

    expect(result.isRecurrenceCreate).toBeUndefined();
    expect(result.isRecurrenceUpdate).toBeUndefined();
    expect(result.isRecurrenceCancel).toBeUndefined();
    expect(result.task.startDate).toBe('2023-01-01T05:00');
    expect(result.recurrence).toBeNull();
  });
});
