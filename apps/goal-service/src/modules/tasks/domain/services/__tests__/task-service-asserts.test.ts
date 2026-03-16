import { TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { Task, TaskIdBuilder } from '../../aggregates/task';
import { Priority, Weight } from '../../aggregates/task/value-objects';
import { taskServiceAsserts } from '../task-service-asserts';

function buildTask(
  input: { id?: number; startDate?: string; deadline?: string; recurrenceId?: number; status?: TaskStatus } = {},
): Task {
  return Task.restore({
    id: input.id ?? 11,
    userId: 77,
    name: Name.create('Task'),
    description: 'desc',
    priority: Priority.create(1),
    weight: Weight.create(1),
    startDate: input.startDate != null ? DateVo.restore(input.startDate) : undefined,
    deadline: input.deadline != null ? DateVo.restore(input.deadline) : undefined,
    endDate: undefined,
    status: input.status ?? TaskStatus.IN_PROGRESS,
    recurrenceId: input.recurrenceId,
  });
}

describe('taskServiceAsserts', () => {
  test('parses valid virtual id', () => {
    expect(
      taskServiceAsserts.ensureVirtualId(TaskIdBuilder.wrapVirtualId({ recurrenceId: 19, date: '2026-03-12T10:00' })),
    ).toEqual({ recurrenceId: 19, date: '2026-03-12T10:00' });
  });

  test('rejects invalid virtual id', () => {
    expect(() => taskServiceAsserts.ensureVirtualId(TaskIdBuilder.wrapOriginId(11))).toThrow();
  });

  test('rejects mismatched recurrence ids', () => {
    expect(() =>
      taskServiceAsserts.ensureRecurrenceIdMatched({
        taskId: 11,
        currentRecurrenceId: 19,
        nextRecurrenceId: 31,
      }),
    ).toThrow();
  });

  test('rejects mismatched recurrence task id', () => {
    expect(() =>
      taskServiceAsserts.ensureRecurrenceAndTaskMatched({
        taskId: 11,
        expectedTaskId: 12,
      }),
    ).toThrow();
  });

  test('rejects non-repeatable source task', () => {
    expect(() =>
      taskServiceAsserts.ensureRepeatableSourceTask(
        buildTask({ startDate: '2026-03-01T10:00:00.000Z', recurrenceId: 19 }),
      ),
    ).toThrow();
  });

  test('rejects mismatched recurrence start date', () => {
    expect(() =>
      taskServiceAsserts.ensureRecurrenceStartMatched({
        taskId: 11,
        date: '2026-03-13T10:00',
        expectedDate: '2026-03-12T10:00',
      }),
    ).toThrow();
  });
});
