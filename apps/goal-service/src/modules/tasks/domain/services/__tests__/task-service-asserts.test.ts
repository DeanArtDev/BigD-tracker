import { RecurrenceFrequency, TaskRecurrenceStatus, TaskRecurrenceWeekday, TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name, TimezoneVo } from '@big-d/api-utils';
import { Task, TaskIdBuilder, TaskRecurrence } from '../../aggregates/task';
import { Priority, Weight } from '../../aggregates/task/value-objects';
import { taskServiceAsserts } from '../task-service-asserts';

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

describe('taskServiceAsserts', () => {
  test('parses valid virtual id', () => {
    expect(
      taskServiceAsserts.ensureVirtualId(
        TaskIdBuilder.wrapVirtualId({ recurrenceId: 19, date: '2026-03-12T10:00:00.000Z' }),
      ),
    ).toEqual({ recurrenceId: 19, date: '2026-03-12T10:00:00.000Z' });
  });

  test('rejects invalid virtual id', () => {
    expect(() => taskServiceAsserts.ensureVirtualId(TaskIdBuilder.wrapOriginId(11))).toThrow();
  });

  test('parses valid override id', () => {
    expect(
      taskServiceAsserts.ensureOverrideId(
        TaskIdBuilder.wrapOverrideId({ recurrenceId: 19, overrideId: 31, date: '2026-03-12T10:00:00.000Z' }),
      ),
    ).toEqual({ recurrenceId: 19, overrideId: 31, date: '2026-03-12T10:00:00.000Z' });
  });

  test('rejects invalid override id', () => {
    expect(() => taskServiceAsserts.ensureOverrideId(TaskIdBuilder.wrapOriginId(11))).toThrow();
  });

  test('rejects mismatched source task and recurrence', () => {
    expect(() =>
      taskServiceAsserts.ensureSourceTaskBelongsToRecurrence({
        taskId: 'v::19::2026-03-12T10:00:00.000Z',
        sourceTask: buildTask({ id: 11 }),
        currentRecurrence: buildRecurrence({ taskId: 12 }),
      }),
    ).toThrow();
  });

  test('rejects canceled recurrence', () => {
    expect(() =>
      taskServiceAsserts.ensureRecurrenceIsNotCanceled(buildRecurrence({ status: TaskRecurrenceStatus.CANCELED })),
    ).toThrow();
  });

  test('rejects non-repeatable source task', () => {
    expect(() =>
      taskServiceAsserts.ensureRepeatableSourceTask({
        taskId: 'v::19::2026-03-12T10:00:00.000Z',
        sourceTask: buildTask({ startDate: '2026-03-01T10:00:00.000Z' }),
      }),
    ).toThrow();
  });

  test('rejects mismatched override date', () => {
    expect(() =>
      taskServiceAsserts.ensureOverrideDateMatchesTaskId({
        taskId: 'ov::19::2026-03-12T10:00:00.000Z::31',
        overrideDate: '2026-03-13T10:00:00.000Z',
        expectedDate: '2026-03-12T10:00:00.000Z',
      }),
    ).toThrow();
  });
});
