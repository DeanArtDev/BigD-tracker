import {
  RecurrenceFrequency,
  TaskOverrideType,
  TaskRecurrenceStatus,
  TaskRecurrenceWeekday,
  TaskStatus,
} from '@big-d/api-contracts';
import { DateVo, Name, TimezoneVo } from '@big-d/api-utils';
import { Task, TaskIdBuilder, TaskOverride, TaskRecurrence } from '../../aggregates/task';
import { Priority, Weight } from '../../aggregates/task/value-objects';
import { TaskOverrideDomainService } from '../task-override.domain.service';

function buildTask(
  input: { id?: number; recurrenceId?: number; startDate?: string; deadline?: string; status?: TaskStatus } = {},
): Task {
  return Task.restore({
    id: input.id ?? 11,
    userId: 77,
    name: Name.create('Source task'),
    description: 'source desc',
    priority: Priority.create(1),
    weight: Weight.create(1),
    startDate: input.startDate != null ? DateVo.restore(input.startDate) : undefined,
    deadline: input.deadline != null ? DateVo.restore(input.deadline) : undefined,
    endDate: undefined,
    status: input.status ?? TaskStatus.IN_PROGRESS,
    recurrenceId: input.recurrenceId,
  });
}

function buildRecurrence(
  input: { id?: number; taskId?: number; timezone?: string; status?: TaskRecurrenceStatus; startDate?: string } = {},
): TaskRecurrence {
  return TaskRecurrence.restore({
    id: input.id ?? 19,
    userId: 77,
    taskId: input.taskId ?? 11,
    status: input.status ?? TaskRecurrenceStatus.ACTIVE,
    timezone: TimezoneVo.create(input.timezone ?? 'UTC'),
    startDate: DateVo.restore(input.startDate ?? '2026-03-01T10:00:00.000Z'),
    pattern: 'RRULE:FREQ=DAILY',
    frequency: RecurrenceFrequency.DAILY,
    weekstart: TaskRecurrenceWeekday.MO,
  });
}

function buildOverride(
  input: {
    id?: number;
    recurrenceId?: number;
    recurrenceStart?: string;
    status?: TaskStatus;
    startDate?: string;
    deadline?: string;
  } = {},
): TaskOverride {
  return TaskOverride.restore({
    task: Task.restore({
      id: input.id ?? 31,
      userId: 77,
      name: Name.create('Override task'),
      description: 'override desc',
      priority: Priority.create(4),
      weight: Weight.create(9),
      startDate: DateVo.restore(input.startDate ?? '2026-03-12T09:30'),
      deadline: DateVo.restore(input.deadline ?? '2026-03-12T13:45'),
      endDate: undefined,
      status: input.status ?? TaskStatus.IN_PROGRESS,
    }),
    recurrenceId: input.recurrenceId ?? 19,
    recurrenceStart: DateVo.restore(input.recurrenceStart ?? '2026-03-12T10:00'),
    type: TaskOverrideType.OVERRIDE,
  });
}

describe('TaskOverrideDomainService', () => {
  const service = new TaskOverrideDomainService();

  afterEach(() => {
    jest.useRealTimers();
  });

  test('rejects repeatable recurrence payload for override task', () => {
    expect(() =>
      service.ensureOverrideTaskNotRepeatable({
        taskId: 'ov::19::2026-03-12T10:00::31',
        recurrence: { frequency: RecurrenceFrequency.DAILY },
      }),
    ).toThrow();
  });

  test('rejects override task when recurrence id from id does not match current recurrence', () => {
    expect(() =>
      service.clone({
        taskId: TaskIdBuilder.wrapOverrideId({
          recurrenceId: 99,
          overrideId: 31,
          date: '2026-03-12T10:00',
        }),
        sourceTask: buildTask({
          id: 11,
          recurrenceId: 19,
          startDate: '2026-03-01T10:00:00.000Z',
          deadline: '2026-03-01T12:00:00.000Z',
        }),
        currentRecurrence: buildRecurrence({ id: 19, taskId: 11, startDate: '2026-03-12T10:00' }),
        override: buildOverride({ id: 31 }),
      }),
    ).toThrow();
  });

  test('rejects override task when source task and recurrence taskId do not match', () => {
    expect(() =>
      service.clone({
        taskId: TaskIdBuilder.wrapOverrideId({
          recurrenceId: 19,
          overrideId: 31,
          date: '2026-03-12T10:00',
        }),
        sourceTask: buildTask({
          id: 11,
          recurrenceId: 19,
          startDate: '2026-03-01T10:00:00.000Z',
          deadline: '2026-03-01T12:00:00.000Z',
        }),
        currentRecurrence: buildRecurrence({ id: 19, taskId: 12, startDate: '2026-03-12T10:00' }),
        override: buildOverride({ id: 31 }),
      }),
    ).toThrow();
  });

  test('rejects override task without deadline on source task', () => {
    expect(() =>
      service.clone({
        taskId: TaskIdBuilder.wrapOverrideId({
          recurrenceId: 19,
          overrideId: 31,
          date: '2026-03-12T10:00',
        }),
        sourceTask: buildTask({
          id: 11,
          recurrenceId: 19,
          startDate: '2026-03-01T10:00:00.000Z',
        }),
        currentRecurrence: buildRecurrence({ id: 19, taskId: 11, startDate: '2026-03-12T10:00' }),
        override: buildOverride({ id: 31 }),
      }),
    ).toThrow();
  });

  test('clones override using override dates', () => {
    const override = buildOverride({
      id: 31,
      status: TaskStatus.COMPLETED,
      startDate: '2026-03-12T09:30',
      deadline: '2026-03-12T13:45',
    });

    const result = service.clone({
      taskId: TaskIdBuilder.wrapOverrideId({
        recurrenceId: 19,
        overrideId: 31,
        date: '2026-03-12T10:00',
      }),
      sourceTask: buildTask({
        id: 11,
        recurrenceId: 19,
        startDate: '2026-03-01T10:00:00.000Z',
        deadline: '2026-03-01T12:00:00.000Z',
      }),
      currentRecurrence: buildRecurrence({ id: 19, taskId: 11, startDate: '2026-03-12T10:00' }),
      override,
    });

    expect(result.task.id).toBeNaN();
    expect(result.task.userId).toBe(77);
    expect(result.task.groupId).toBeUndefined();
    expect(result.task.recurrenceId).toBeUndefined();
    expect(result.task.name).toBe('Override task');
    expect(result.task.description).toBe('override desc');
    expect(result.task.priority).toBe(4);
    expect(result.task.weight).toBe(9);
    expect(result.task.startDate).toBe('2026-03-12T09:30');
    expect(result.task.deadline).toBe('2026-03-12T13:45');
    expect(result.task.endDate).toBeUndefined();
    expect(result.task.status).toBe(TaskStatus.IN_PROGRESS);
  });

  test('clones override from canceled recurrence', () => {
    const override = buildOverride({
      id: 31,
      startDate: '2026-03-12T09:30',
      deadline: '2026-03-12T13:45',
    });

    const result = service.clone({
      taskId: TaskIdBuilder.wrapOverrideId({
        recurrenceId: 19,
        overrideId: 31,
        date: '2026-03-12T10:00',
      }),
      sourceTask: buildTask({
        id: 11,
        recurrenceId: 19,
        startDate: '2026-03-01T10:00:00.000Z',
        deadline: '2026-03-01T12:00:00.000Z',
      }),
      currentRecurrence: buildRecurrence({
        id: 19,
        taskId: 11,
        status: TaskRecurrenceStatus.CANCELED,
        startDate: '2026-03-12T10:00',
      }),
      override,
    });

    expect(result.task.id).toBeNaN();
    expect(result.task.startDate).toBe('2026-03-12T09:30');
    expect(result.task.deadline).toBe('2026-03-12T13:45');
  });

  test('rejects deleting override that belongs to another recurrence', () => {
    expect(() =>
      service.delete({
        taskId: TaskIdBuilder.wrapOverrideId({
          recurrenceId: 19,
          overrideId: 31,
          date: '2026-03-12T10:00',
        }),
        sourceTask: buildTask({
          id: 11,
          recurrenceId: 19,
          startDate: '2026-03-01T10:00:00.000Z',
          deadline: '2026-03-01T12:00:00.000Z',
        }),
        currentRecurrence: buildRecurrence({ id: 19, taskId: 11, startDate: '2026-03-12T10:00' }),
        override: buildOverride({ id: 31, recurrenceId: 99 }),
        currentOverrides: [buildOverride({ id: 31, recurrenceId: 99 })],
      }),
    ).toThrow();
  });

  test('rejects deleting override that belongs to another recurrence date', () => {
    expect(() =>
      service.delete({
        taskId: TaskIdBuilder.wrapOverrideId({
          recurrenceId: 19,
          overrideId: 31,
          date: '2026-03-12T10:00',
        }),
        sourceTask: buildTask({
          id: 11,
          recurrenceId: 19,
          startDate: '2026-03-01T10:00:00.000Z',
          deadline: '2026-03-01T12:00:00.000Z',
        }),
        currentRecurrence: buildRecurrence({ id: 19, taskId: 11, startDate: '2026-03-12T10:00' }),
        override: buildOverride({ id: 31, recurrenceStart: '2026-03-13T10:00:00.000Z' }),
        currentOverrides: [buildOverride({ id: 31, recurrenceStart: '2026-03-13T10:00:00.000Z' })],
      }),
    ).toThrow();
  });

  test('deletes override using override state instead of source task state', () => {
    const override = buildOverride({ id: 31, status: TaskStatus.IN_PROGRESS });

    const result = service.delete({
      taskId: TaskIdBuilder.wrapOverrideId({
        recurrenceId: 19,
        overrideId: 31,
        date: '2026-03-12T10:00',
      }),
      sourceTask: buildTask({
        id: 11,
        recurrenceId: 19,
        startDate: '2026-03-01T10:00:00.000Z',
        deadline: '2026-03-01T12:00:00.000Z',
        status: TaskStatus.DELETED,
      }),
      currentRecurrence: buildRecurrence({ id: 19, taskId: 11, startDate: '2026-03-12T10:00' }),
      override,
      currentOverrides: [override],
    });

    expect(result.overrideToDelete).toBe(override);
    expect(result.overrideToDelete.id).toBe(31);
    expect(result.overrideToDelete.recurrenceId).toBe(19);
    expect(result.overrideToDelete.recurrenceStart).toBe('2026-03-12T10:00');
    expect(result.overrideToDelete.name).toBe('Override task');
    expect(result.overrideToDelete.description).toBe('override desc');
    expect(result.overrideToDelete.priority).toBe(4);
    expect(result.overrideToDelete.weight).toBe(9);
    expect(result.overrideToDelete.cancelReason).toBeUndefined();
    expect(result.overrideToDelete.startDate).toBe('2026-03-12T09:30');
    expect(result.overrideToDelete.deadline).toBe('2026-03-12T13:45');
    expect(result.overrideToDelete.endDate).toBeUndefined();
    expect(result.overrideToDelete.type).toBe(TaskOverrideType.DELETED);
    expect(result.overrideToDelete.status).toBe(TaskStatus.DELETED);
  });

  test('finishes override with COMPLETED when override deadline is after finish date', () => {
    const override = buildOverride({
      id: 31,
      status: TaskStatus.IN_PROGRESS,
      deadline: '2026-03-13T13:45',
    });
    const finishedAt = new Date('2026-03-12T12:00');

    jest.useFakeTimers().setSystemTime(finishedAt);

    const result = service.finish({
      taskId: TaskIdBuilder.wrapOverrideId({
        recurrenceId: 19,
        overrideId: 31,
        date: '2026-03-12T10:00',
      }),
      sourceTask: buildTask({
        id: 11,
        recurrenceId: 19,
        startDate: '2026-03-01T10:00:00.000Z',
        deadline: '2026-03-01T12:00:00.000Z',
        status: TaskStatus.DELETED,
      }),
      currentRecurrence: buildRecurrence({ id: 19, taskId: 11, startDate: '2026-03-12T10:00' }),
      override,
      timezone: 'UTC',
    });

    expect(result.override).toBe(override);
    expect(result.override.id).toBe(31);
    expect(result.override.recurrenceId).toBe(19);
    expect(result.override.recurrenceStart).toBe('2026-03-12T10:00');
    expect(result.override.name).toBe('Override task');
    expect(result.override.description).toBe('override desc');
    expect(result.override.priority).toBe(4);
    expect(result.override.weight).toBe(9);
    expect(result.override.cancelReason).toBeUndefined();
    expect(result.override.startDate).toBe('2026-03-12T09:30');
    expect(result.override.deadline).toBe('2026-03-13T13:45');
    expect(result.override.endDate).toBe('2026-03-12T12:00');
    expect(result.override.type).toBe(TaskOverrideType.OVERRIDE);
    expect(result.override.status).toBe(TaskStatus.COMPLETED);
  });

  test('finishes override with OVERDUE when override deadline is before finish date', () => {
    const override = buildOverride({
      id: 31,
      status: TaskStatus.IN_PROGRESS,
      deadline: '2026-03-12T11:45',
    });
    const finishedAt = new Date('2026-03-12T12:00');

    jest.useFakeTimers().setSystemTime(finishedAt);

    const result = service.finish({
      taskId: TaskIdBuilder.wrapOverrideId({
        recurrenceId: 19,
        overrideId: 31,
        date: '2026-03-12T10:00',
      }),
      sourceTask: buildTask({
        id: 11,
        recurrenceId: 19,
        startDate: '2026-03-01T10:00:00.000Z',
        deadline: '2026-03-01T12:00:00.000Z',
        status: TaskStatus.DELETED,
      }),
      currentRecurrence: buildRecurrence({ id: 19, taskId: 11, startDate: '2026-03-12T10:00' }),
      override,
      timezone: 'UTC',
    });

    expect(result.override).toBe(override);
    expect(result.override.id).toBe(31);
    expect(result.override.recurrenceId).toBe(19);
    expect(result.override.recurrenceStart).toBe('2026-03-12T10:00');
    expect(result.override.name).toBe('Override task');
    expect(result.override.description).toBe('override desc');
    expect(result.override.priority).toBe(4);
    expect(result.override.weight).toBe(9);
    expect(result.override.cancelReason).toBeUndefined();
    expect(result.override.startDate).toBe('2026-03-12T09:30');
    expect(result.override.deadline).toBe('2026-03-12T11:45');
    expect(result.override.endDate).toBe('2026-03-12T12:00');
    expect(result.override.type).toBe(TaskOverrideType.OVERRIDE);
    expect(result.override.status).toBe(TaskStatus.OVERDUE);
  });
});
