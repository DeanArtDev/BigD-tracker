import {
  RecurrenceFrequency,
  TaskOverrideType,
  TaskRecurrenceStatus,
  TaskRecurrenceWeekday,
  TaskStatus,
} from '@big-d/api-contracts';
import { DateVo, Name, TimezoneVo } from '@big-d/api-utils';
import { timeAndDate } from '@shared/date-and-time';
import { Task, TaskIdBuilder, TaskRecurrence } from '../../aggregates/task';
import { Priority, Weight } from '../../aggregates/task/value-objects';
import { TaskVirtualService } from '../task-virtual.service';

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

describe('TaskVirtualService', () => {
  const service = new TaskVirtualService();

  test('creates deleted override for virtual task', () => {
    const virtualDate = '2026-03-12T08:00:00.000Z';
    const sourceTask = buildTask({
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-01T12:30:00.000Z',
    });
    const currentRecurrence = buildRecurrence();

    const result = service.delete({
      taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId: currentRecurrence.id, date: virtualDate }),
      sourceTask,
      currentRecurrence,
    });

    const expectedStart = timeAndDate(virtualDate).tz(currentRecurrence.timezone, true).utc();
    const expectedDeadline = expectedStart.add(150, 'minute');

    expect(result.override.id).toBeNaN();
    expect(result.override.userId).toBe(77);
    expect(result.override.groupId).toBeUndefined();
    expect(result.override.recurrenceId).toBe(currentRecurrence.id);
    expect(result.override.recurrenceStart).toBe(virtualDate);
    expect(result.override.name).toBe('Task');
    expect(result.override.description).toBe('desc');
    expect(result.override.priority).toBe(1);
    expect(result.override.weight).toBe(1);
    expect(result.override.cancelReason).toBeUndefined();
    expect(result.override.startDate).toBe(expectedStart.toISOString());
    expect(result.override.deadline).toBe(expectedDeadline.toISOString());
    expect(result.override.endDate).toBeUndefined();
    expect(result.override.type).toBe(TaskOverrideType.DELETED);
    expect(result.override.status).toBe(TaskStatus.DELETED);
  });

  test('rejects deleting virtual task from canceled recurrence', () => {
    expect(() =>
      service.delete({
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId: 19, date: '2026-03-12T08:00:00.000Z' }),
        sourceTask: buildTask({
          startDate: '2026-03-01T10:00:00.000Z',
          deadline: '2026-03-01T12:30:00.000Z',
        }),
        currentRecurrence: buildRecurrence({ status: TaskRecurrenceStatus.CANCELED }),
      }),
    ).toThrow();
  });

  test('creates overdue override for virtual task when deadline is after finish date', () => {
    const virtualDate = '2026-03-12T10:00:00.000Z';
    const sourceTask = buildTask({
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-02T12:30:00.000Z',
    });
    const currentRecurrence = buildRecurrence();
    const expectedStart = timeAndDate(virtualDate).tz(currentRecurrence.timezone, true).utc();
    const expectedDeadline = expectedStart.add(1590, 'minute');
    const finishedAt = expectedStart.add(1, 'hour').toDate();

    jest.useFakeTimers().setSystemTime(finishedAt);

    try {
      const result = service.finish({
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId: currentRecurrence.id, date: virtualDate }),
        sourceTask,
        currentRecurrence,
      });

      expect(result.override.id).toBeNaN();
      expect(result.override.userId).toBe(77);
      expect(result.override.groupId).toBeUndefined();
      expect(result.override.recurrenceId).toBe(currentRecurrence.id);
      expect(result.override.recurrenceStart).toBe(virtualDate);
      expect(result.override.name).toBe('Task');
      expect(result.override.description).toBe('desc');
      expect(result.override.priority).toBe(1);
      expect(result.override.weight).toBe(1);
      expect(result.override.cancelReason).toBeUndefined();
      expect(result.override.startDate).toBe(expectedStart.toISOString());
      expect(result.override.deadline).toBe(expectedDeadline.toISOString());
      expect(result.override.endDate).toBe(expectedStart.add(1, 'hour').toISOString());
      expect(result.override.type).toBe(TaskOverrideType.OVERRIDE);
      expect(result.override.status).toBe(TaskStatus.OVERDUE);
    } finally {
      jest.useRealTimers();
    }
  });

  test('creates completed override for virtual task when deadline is before finish date', () => {
    const virtualDate = '2026-03-12T10:00:00.000Z';
    const sourceTask = buildTask({
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-01T10:30:00.000Z',
    });
    const currentRecurrence = buildRecurrence();
    const expectedStart = timeAndDate(virtualDate).tz(currentRecurrence.timezone, true).utc();
    const expectedDeadline = expectedStart.add(30, 'minute');
    const finishedAt = expectedStart.add(1, 'hour').toDate();

    jest.useFakeTimers().setSystemTime(finishedAt);

    try {
      const result = service.finish({
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId: currentRecurrence.id, date: virtualDate }),
        sourceTask,
        currentRecurrence,
      });

      expect(result.override.id).toBeNaN();
      expect(result.override.userId).toBe(77);
      expect(result.override.groupId).toBeUndefined();
      expect(result.override.recurrenceId).toBe(currentRecurrence.id);
      expect(result.override.recurrenceStart).toBe(virtualDate);
      expect(result.override.name).toBe('Task');
      expect(result.override.description).toBe('desc');
      expect(result.override.priority).toBe(1);
      expect(result.override.weight).toBe(1);
      expect(result.override.cancelReason).toBeUndefined();
      expect(result.override.startDate).toBe(expectedStart.toISOString());
      expect(result.override.deadline).toBe(expectedDeadline.toISOString());
      expect(result.override.endDate).toBe(expectedStart.add(1, 'hour').toISOString());
      expect(result.override.type).toBe(TaskOverrideType.OVERRIDE);
      expect(result.override.status).toBe(TaskStatus.COMPLETED);
    } finally {
      jest.useRealTimers();
    }
  });
});
