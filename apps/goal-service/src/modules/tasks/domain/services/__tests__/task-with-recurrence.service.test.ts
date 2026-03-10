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

function buildOverride(input: { id?: number; status: TaskStatus; recurrenceId?: number }): TaskOverride {
  return TaskOverride.restore({
    task: buildTask({
      id: input.id ?? 31,
      startDate: '2023-01-03T05:00:00.000Z',
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
      now: '2023-01-01T02:00:00.000Z',
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
        now: '2023-01-03T02:00:00.000Z',
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
      now: '2023-01-01T02:00:00.000Z',
      patternShaper: buildPatternShaper('RRULE:FREQ=WEEKLY'),
    });

    expect(result.isCreate).toBeUndefined();
    expect(result.isUpdate).toBe(true);
    expect(result.isCancel).toBeUndefined();
    expect(result.recurrence?.pattern).toBe('RRULE:FREQ=WEEKLY');
    expect(result.recurrence?.timezone).toBe('Asia/Novosibirsk');
  });

  it('replace marks recurrence cancel status', () => {
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
      now: '2023-01-03T02:00:00.000Z',
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
    });

    expect(result.isCreate).toBeUndefined();
    expect(result.isUpdate).toBeUndefined();
    expect(result.isCancel).toBe(true);
    expect(result.recurrence).toBeNull();
    expect(result.shouldDeleteRecurrence).toBe(true);
    expect(result.shouldDeleteOverrides).toBe(true);
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
      now: '2023-01-03T02:00:00.000Z',
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
    });

    expect(result.isCancel).toBe(true);
    expect(result.isCreate).toBeUndefined();
    expect(result.isUpdate).toBeUndefined();
    expect(result.recurrence).toBeNull();
    expect(result.shouldDeleteRecurrence).toBe(true);
    expect(result.shouldDeleteOverrides).toBe(true);
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
      currentOverrides: [buildOverride({ status: TaskStatus.COMPLETED })],
      recurrencePatch: undefined,
      now: '2023-01-03T02:00:00.000Z',
      patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
    });

    expect(result.isCancel).toBe(true);
    expect(result.isCreate).toBeUndefined();
    expect(result.isUpdate).toBeUndefined();
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.CANCELED);
    expect(result.recurrence).not.toBeNull();
    expect(result.shouldDeleteRecurrence).toBe(false);
    expect(result.shouldDeleteOverrides).toBe(false);
  });

  it('replace requires taskPatch.startDate when recurrence cannot be deleted', () => {
    expect(() =>
      service.replace({
        task: buildTask({ startDate: '2023-01-03T01:00:00.000Z' }),
        taskPatch: {
          name: 'Updated task',
          description: 'new desc',
          priority: 2,
          weight: 3,
        },
        currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-03T12:00:00.000Z' }),
        currentOverrides: [buildOverride({ status: TaskStatus.COMPLETED })],
        recurrencePatch: undefined,
        now: '2023-01-03T02:00:00.000Z',
        patternShaper: buildPatternShaper('RRULE:FREQ=DAILY;UNTIL=20230103T000000Z'),
      }),
    ).toThrow();
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
      now: '2023-01-01T02:00:00.000Z',
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
      cancelDate: '2023-01-01T05:00:00.000Z',
      pattern: 'RRULE:FREQ=DAILY;UNTIL=20230102T000000Z',
      now: '2023-01-02T10:00:00.000Z',
    });

    expect(result.task.startDate).toBe('2023-01-01T05:00:00.000Z');
    expect(result.recurrence?.untilDate).toBe('2023-01-01T17:00:00.000Z');
    expect(result.recurrence?.status).toBe(TaskRecurrenceStatus.CANCELED);
  });

  it('returns null on cancel when recurrence becomes empty', () => {
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
      cancelDate: '2023-01-03T05:00:00.000Z',
      pattern: 'RRULE:FREQ=DAILY;UNTIL=20230103T000000Z',
      now: '2023-01-03T02:00:00.000Z',
    });

    expect(result.recurrence).toBeNull();
  });

  it('requires cancelDate to cancel recurrence', () => {
    expect(() =>
      service.cancel({
        task: buildTask({ startDate: '2023-01-01T01:00:00.000Z' }),
        taskPatch: {
          name: 'Updated task',
          description: 'new desc',
          priority: 2,
          weight: 3,
          startDate: '2023-01-01T05:00:00.000Z',
        },
        currentRecurrence: buildStoredRecurrence({ startDate: '2023-01-01T00:00:00.000Z' }),
        pattern: 'RRULE:FREQ=DAILY',
      }),
    ).toThrow();
  });
});
