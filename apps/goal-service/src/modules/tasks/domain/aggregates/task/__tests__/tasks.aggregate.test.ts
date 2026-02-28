import { TaskStatus, RecurrenceFrequency } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { mockDate } from '@shared/__tests__';
import { futureDate, startOfToday } from '@shared/__tests__/time/helpers';
import { Priority, RecurrenceVo, Weight } from '../value-objects';
import { Task } from '../tasks.aggregate';

mockDate();

const createRecurrence = (
  startDate: string,
  deadline: string,
  frequency = RecurrenceFrequency.DAILY,
) =>
  RecurrenceVo.create({
    startDate: DateVo.create(startDate),
    deadline: DateVo.create(deadline),
    frequency,
  });

const createTask = (params?: { recurrence?: RecurrenceVo }) =>
  Task.create({
    userId: 1,
    name: Name.create('Task'),
    description: 'desc',
    priority: Priority.create(2),
    weight: Weight.create(10),
    recurrence:
      params?.recurrence ??
      RecurrenceVo.create({
        frequency: undefined,
        deadline: undefined,
        startDate: undefined,
      }),
  });

describe('Task aggregate', () => {
  it('creates NOT_STARTED task without recurrence', () => {
    const task = createTask();

    expect(task.status).toBe(TaskStatus.NOT_STARTED);
    expect(task.recurrence.value.startDate).toBeUndefined();
    expect(task.recurrence.value.deadline).toBeUndefined();
    expect(task.recurrence.value.frequency).toBeUndefined();
  });

  it('creates IN_PROGRESS task with recurrence.startDate', () => {
    const task = createTask({
      recurrence: createRecurrence(futureDate(1), futureDate(2)),
    });

    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(task.startDate).toBe(futureDate(1));
    expect(task.deadline).toBe(futureDate(2));
  });

  it('restores task with recurrence', () => {
    const task = Task.restore({
      id: 10,
      userId: 1,
      name: Name.create('Restored'),
      description: 'desc',
      priority: Priority.create(2),
      weight: Weight.create(10),
      status: TaskStatus.NOT_STARTED,
      recurrence: createRecurrence(futureDate(2), futureDate(3), RecurrenceFrequency.WEEKLY),
    });

    expect(task.isDraft).toBe(false);
    expect(task.recurrence?.value.frequency).toBe(RecurrenceFrequency.WEEKLY);
  });

  it('replaces full state for NOT_STARTED task when recurrence has both dates', () => {
    const task = createTask({
      recurrence: createRecurrence(futureDate(1), futureDate(2)),
    });

    task.replace({
      name: Name.create('Updated'),
      description: 'updated',
      priority: Priority.create(3),
      weight: Weight.create(20),
      recurrence: createRecurrence(futureDate(3), futureDate(4), RecurrenceFrequency.MONTHLY),
    });

    expect(task.name).toBe('Updated');
    expect(task.priority).toBe(3);
    expect(task.weight).toBe(20);
    expect(task.startDate).toBe(futureDate(3));
    expect(task.deadline).toBe(futureDate(4));
  });

  it('allows partial replace for COMPLETED when immutable fields are unchanged', () => {
    const recurrence = createRecurrence(futureDate(1), futureDate(2));
    const task = Task.restore({
      id: 11,
      userId: 1,
      name: Name.create('Done'),
      description: 'desc',
      priority: Priority.create(2),
      weight: Weight.create(10),
      status: TaskStatus.COMPLETED,
      recurrence,
    });

    expect(() =>
      task.replace({
        name: Name.create('Done updated'),
        description: 'updated',
        priority: Priority.create(2),
        weight: Weight.create(10),
        recurrence: RecurrenceVo.create({
          frequency: undefined,
          deadline: undefined,
          startDate: undefined,
        }),
      }),
    ).not.toThrow();
  });

  it('rejects partial replace when immutable fields are changed', () => {
    const task = Task.restore({
      id: 12,
      userId: 1,
      name: Name.create('Done'),
      description: 'desc',
      priority: Priority.create(2),
      weight: Weight.create(10),
      status: TaskStatus.COMPLETED,
      recurrence: createRecurrence(futureDate(1), futureDate(2)),
    });

    expect(() =>
      task.replace({
        name: Name.create('Done updated'),
        description: 'updated',
        priority: Priority.create(1),
        weight: Weight.create(10),
        recurrence: createRecurrence(futureDate(1), futureDate(2)),
      }),
    ).toThrow();
  });

  it('finishes task with COMPLETED when deadline is in future', () => {
    const task = Task.restore({
      id: 13,
      userId: 1,
      name: Name.create('To finish'),
      priority: Priority.create(2),
      weight: Weight.create(10),
      status: TaskStatus.IN_PROGRESS,
      recurrence: createRecurrence(startOfToday(), futureDate(1)),
    });

    task.finish();

    expect(task.status).toBe(TaskStatus.COMPLETED);
    expect(task.endDate).toBeDefined();
  });
});
