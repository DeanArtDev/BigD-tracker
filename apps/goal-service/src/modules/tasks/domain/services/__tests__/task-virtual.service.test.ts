import {
  RecurrenceFrequency,
  TaskFinishStatus,
  TaskOverrideType,
  TaskRecurrenceStatus,
  TaskRecurrenceWeekday,
  TaskStatus,
} from '@big-d/api-contracts';
import { DateVo, Name, TimezoneVo } from '@big-d/api-utils';
import { timeAndDate } from '@big-d/api-utils';
import { Task, TaskIdBuilder, TaskRecurrence } from '../../aggregates/task';
import { Priority } from '../../aggregates/task/value-objects';
import { TaskVirtualService } from '../task-virtual.service';

function buildTask(
  input: { id?: number; recurrenceId?: number; startDate?: string; deadline?: string; status?: TaskStatus } = {},
): Task {
  return Task.restore({
    id: input.id ?? 11,
    userId: 77,
    name: Name.create('Task'),
    description: 'desc',
    priority: Priority.create(1),
    startDate: input.startDate != null ? DateVo.restore(input.startDate) : undefined,
    deadline: input.deadline != null ? DateVo.restore(input.deadline) : undefined,
    endDate: undefined,
    status: input.status ?? TaskStatus.IN_PROGRESS,
    recurrenceId: input.recurrenceId,
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
    startDate: DateVo.restore('2026-03-01T10:00:00.000Z'),
    pattern: 'RRULE:FREQ=DAILY',
    frequency: RecurrenceFrequency.DAILY,
    weekstart: TaskRecurrenceWeekday.MO,
  });
}

describe('TaskVirtualService', () => {
  const service = new TaskVirtualService();

  test('rejects repeatable recurrence payload for virtual task', () => {
    expect(() =>
      service.ensureVirtualTaskNotRepeatable({
        taskId: 'v::19::2026-03-12T08:00',
        recurrence: { frequency: RecurrenceFrequency.DAILY },
      }),
    ).toThrow();
  });

  test('rejects virtual task when recurrence id from id does not match source task/current recurrence', () => {
    expect(() =>
      service.clone({
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId: 99, date: '2026-03-12T08:00:00.000Z' }),
        sourceTask: buildTask({
          recurrenceId: 19,
          startDate: '2026-03-01T10:00:00.000Z',
          deadline: '2026-03-01T12:30:00.000Z',
        }),
        currentRecurrence: buildRecurrence({ id: 19, taskId: 11 }),
      }),
    ).toThrow();
  });

  test('rejects virtual task when source task and recurrence taskId do not match', () => {
    expect(() =>
      service.clone({
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId: 19, date: '2026-03-12T08:00:00.000Z' }),
        sourceTask: buildTask({
          id: 11,
          recurrenceId: 19,
          startDate: '2026-03-01T10:00:00.000Z',
          deadline: '2026-03-01T12:30:00.000Z',
        }),
        currentRecurrence: buildRecurrence({ id: 19, taskId: 12 }),
      }),
    ).toThrow();
  });

  test('rejects virtual task without deadline', () => {
    expect(() =>
      service.delete({
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId: 19, date: '2026-03-12T08:00:00.000Z' }),
        sourceTask: buildTask({
          recurrenceId: 19,
          startDate: '2026-03-01T10:00:00.000Z',
        }),
        currentRecurrence: buildRecurrence(),
      }),
    ).toThrow();
  });

  test('clones virtual task with materialized virtual dates', () => {
    const virtualDate = '2026-03-12T08:00:00.000Z';
    const sourceTask = buildTask({
      recurrenceId: 19,
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-01T12:30:00.000Z',
    });
    const currentRecurrence = buildRecurrence();

    const result = service.clone({
      taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId: currentRecurrence.id, date: virtualDate }),
      sourceTask,
      currentRecurrence,
    });

    const expectedStart = timeAndDate(virtualDate).tz(currentRecurrence.timezone, true).utc();
    const expectedDeadline = expectedStart.add(150, 'minute');

    expect(result.task.id).toBeNaN();
    expect(result.task.userId).toBe(77);
    expect(result.task.groupId).toBeUndefined();
    expect(result.task.recurrenceId).toBeUndefined();
    expect(result.task.name).toBe('Task');
    expect(result.task.description).toBe('desc');
    expect(result.task.priority).toBe(1);
    expect(result.task.startDate).toBe(DateVo.format(expectedStart.toISOString()));
    expect(result.task.deadline).toBe(DateVo.format(expectedDeadline.toISOString()));
    expect(result.task.endDate).toBeUndefined();
    expect(result.task.status).toBe(TaskStatus.IN_PROGRESS);
  });

  test('clones virtual task from canceled recurrence', () => {
    const virtualDate = '2026-03-12T08:00:00.000Z';
    const sourceTask = buildTask({
      recurrenceId: 19,
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-01T12:30:00.000Z',
    });
    const currentRecurrence = buildRecurrence({ status: TaskRecurrenceStatus.CANCELED });

    const result = service.clone({
      taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId: currentRecurrence.id, date: virtualDate }),
      sourceTask,
      currentRecurrence,
    });

    expect(result.task.id).toBeNaN();
    expect(result.task.startDate).toBeDefined();
    expect(result.task.deadline).toBeDefined();
  });

  test('creates deleted override for virtual task', () => {
    const virtualDate = '2026-03-12T08:00:00.000Z';
    const sourceTask = buildTask({
      recurrenceId: 19,
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
    expect(result.override.recurrenceStart).toBe(DateVo.format(virtualDate));
    expect(result.override.name).toBe('Task');
    expect(result.override.description).toBe('desc');
    expect(result.override.priority).toBe(1);
    expect(result.override.cancelReason).toBeUndefined();
    expect(result.override.startDate).toBe(DateVo.format(expectedStart.toISOString()));
    expect(result.override.deadline).toBe(DateVo.format(expectedDeadline.toISOString()));
    expect(result.override.endDate).toBeUndefined();
    expect(result.override.type).toBe(TaskOverrideType.DELETED);
    expect(result.override.status).toBe(TaskStatus.DELETED);
  });

  test('creates completed override for virtual task when deadline is after finish date', () => {
    const virtualDate = '2026-03-12T10:00:00.000Z';
    const sourceTask = buildTask({
      recurrenceId: 19,
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-02T12:30:00.000Z',
    });
    const currentRecurrence = buildRecurrence();
    const expectedStart = timeAndDate(virtualDate).tz(currentRecurrence.timezone, true).utc();
    const expectedDeadline = expectedStart.add(1590, 'minute');
    const finishedAt = expectedStart.add(1, 'hour').toDate();

    jest.useFakeTimers().setSystemTime(finishedAt);
    const result = service.finish(
      {
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId: currentRecurrence.id, date: virtualDate }),
        sourceTask,
        currentRecurrence,
      },
      {
        timezone: 'UTC',
        type: TaskFinishStatus.COMPLETED,
      },
    );

    expect(result.override.id).toBeNaN();
    expect(result.override.userId).toBe(77);
    expect(result.override.groupId).toBeUndefined();
    expect(result.override.recurrenceId).toBe(currentRecurrence.id);
    expect(result.override.recurrenceStart).toBe(DateVo.format(virtualDate));
    expect(result.override.name).toBe('Task');
    expect(result.override.description).toBe('desc');
    expect(result.override.priority).toBe(1);
    expect(result.override.cancelReason).toBeUndefined();
    expect(result.override.startDate).toBe(DateVo.format(expectedStart.toISOString()));
    expect(result.override.deadline).toBe(DateVo.format(expectedDeadline.toISOString()));
    expect(result.override.endDate).toBe(DateVo.format(expectedStart.add(1, 'hour').toISOString()));
    expect(result.override.type).toBe(TaskOverrideType.OVERRIDE);
    expect(result.override.status).toBe(TaskStatus.COMPLETED);
  });

  test('creates overdue override for virtual task when deadline is before finish date', () => {
    const virtualDate = '2026-03-12T10:00:00.000Z';
    const sourceTask = buildTask({
      recurrenceId: 19,
      startDate: '2026-03-01T10:00:00.000Z',
      deadline: '2026-03-01T10:30:00.000Z',
    });
    const currentRecurrence = buildRecurrence();
    const expectedStart = timeAndDate(virtualDate).tz(currentRecurrence.timezone, true).utc();
    const expectedDeadline = expectedStart.add(30, 'minute');
    const finishedAt = expectedStart.add(1, 'hour').toDate();

    jest.useFakeTimers().setSystemTime(finishedAt);
    const result = service.finish(
      {
        taskId: TaskIdBuilder.wrapVirtualId({ recurrenceId: currentRecurrence.id, date: virtualDate }),
        sourceTask,
        currentRecurrence,
      },
      {
        timezone: 'UTC',
        type: TaskFinishStatus.OVERDUE,
      },
    );

    expect(result.override.id).toBeNaN();
    expect(result.override.userId).toBe(77);
    expect(result.override.groupId).toBeUndefined();
    expect(result.override.recurrenceId).toBe(currentRecurrence.id);
    expect(result.override.recurrenceStart).toBe(DateVo.format(virtualDate));
    expect(result.override.name).toBe('Task');
    expect(result.override.description).toBe('desc');
    expect(result.override.priority).toBe(1);
    expect(result.override.cancelReason).toBeUndefined();
    expect(result.override.startDate).toBe(DateVo.format(expectedStart.toISOString()));
    expect(result.override.deadline).toBe(DateVo.format(expectedDeadline.toISOString()));
    expect(result.override.endDate).toBe(DateVo.format(expectedStart.add(1, 'hour').toISOString()));
    expect(result.override.type).toBe(TaskOverrideType.OVERRIDE);
    expect(result.override.status).toBe(TaskStatus.OVERDUE);
  });
});
