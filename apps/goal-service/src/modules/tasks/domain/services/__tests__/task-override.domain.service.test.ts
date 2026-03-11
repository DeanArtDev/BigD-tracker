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

function buildTask(input: { id?: number; startDate?: string; deadline?: string; status?: TaskStatus } = {}): Task {
  return Task.restore({
    id: input.id ?? 11,
    userId: 77,
    name: Name.create('Source task'),
    description: 'source desc',
    priority: Priority.create(1),
    weight: Weight.create(1),
    startDate: input.startDate != null ? DateVo.create(input.startDate) : undefined,
    deadline: input.deadline != null ? DateVo.create(input.deadline) : undefined,
    endDate: undefined,
    status: input.status ?? TaskStatus.IN_PROGRESS,
  });
}

function buildRecurrence(
  input: { id?: number; taskId?: number; timezone?: string; status?: TaskRecurrenceStatus } = {},
): TaskRecurrence {
  return TaskRecurrence.restore({
    id: input.id ?? 19,
    userId: 77,
    taskId: input.taskId ?? 11,
    status: input.status ?? TaskRecurrenceStatus.ACTIVE,
    timezone: TimezoneVo.create(input.timezone ?? 'UTC'),
    startDate: DateVo.create('2026-03-01T10:00:00.000Z'),
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
      startDate: DateVo.create('2026-03-12T09:30:00.000Z'),
      deadline: DateVo.create('2026-03-12T13:45:00.000Z'),
      endDate: undefined,
      status: input.status ?? TaskStatus.IN_PROGRESS,
    }),
    recurrenceId: input.recurrenceId ?? 19,
    recurrenceStart: DateVo.create(input.recurrenceStart ?? '2026-03-12T10:00:00.000Z'),
    type: TaskOverrideType.OVERRIDE,
  });
}

describe('TaskOverrideDomainService', () => {
  const service = new TaskOverrideDomainService();

  test('rejects deleting override that belongs to another recurrence', () => {
    expect(() =>
      service.delete({
        taskId: TaskIdBuilder.wrapOverrideId({
          recurrenceId: 19,
          overrideId: 31,
          date: '2026-03-12T10:00:00.000Z',
        }),
        sourceTask: buildTask({
          id: 11,
          startDate: '2026-03-01T10:00:00.000Z',
          deadline: '2026-03-01T12:00:00.000Z',
        }),
        currentRecurrence: buildRecurrence({ id: 19, taskId: 11 }),
        override: buildOverride({ id: 31, recurrenceId: 99 }),
      }),
    ).toThrow();
  });

  test('rejects deleting override that belongs to another recurrence date', () => {
    expect(() =>
      service.delete({
        taskId: TaskIdBuilder.wrapOverrideId({
          recurrenceId: 19,
          overrideId: 31,
          date: '2026-03-12T10:00:00.000Z',
        }),
        sourceTask: buildTask({
          id: 11,
          startDate: '2026-03-01T10:00:00.000Z',
          deadline: '2026-03-01T12:00:00.000Z',
        }),
        currentRecurrence: buildRecurrence({ id: 19, taskId: 11 }),
        override: buildOverride({ id: 31, recurrenceStart: '2026-03-13T10:00:00.000Z' }),
      }),
    ).toThrow();
  });

  test('deletes override using override state instead of source task state', () => {
    const override = buildOverride({ id: 31, status: TaskStatus.IN_PROGRESS });

    const result = service.delete({
      taskId: TaskIdBuilder.wrapOverrideId({
        recurrenceId: 19,
        overrideId: 31,
        date: '2026-03-12T10:00:00.000Z',
      }),
      sourceTask: buildTask({
        id: 11,
        startDate: '2026-03-01T10:00:00.000Z',
        deadline: '2026-03-01T12:00:00.000Z',
        status: TaskStatus.DELETED,
      }),
      currentRecurrence: buildRecurrence({ id: 19, taskId: 11 }),
      override,
    });

    expect(result.override).toBe(override);
    expect(result.override.id).toBe(31);
    expect(result.override.recurrenceId).toBe(19);
    expect(result.override.recurrenceStart).toBe('2026-03-12T10:00:00.000Z');
    expect(result.override.name).toBe('Override task');
    expect(result.override.description).toBe('override desc');
    expect(result.override.priority).toBe(4);
    expect(result.override.weight).toBe(9);
    expect(result.override.cancelReason).toBeUndefined();
    expect(result.override.startDate).toBe('2026-03-12T09:30:00.000Z');
    expect(result.override.deadline).toBe('2026-03-12T13:45:00.000Z');
    expect(result.override.endDate).toBeUndefined();
    expect(result.override.type).toBe(TaskOverrideType.DELETED);
    expect(result.override.status).toBe(TaskStatus.DELETED);
  });
});
