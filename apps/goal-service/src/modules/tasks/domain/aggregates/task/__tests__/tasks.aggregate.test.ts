import { TaskStatus, RecurrenceFrequency } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { mockDate } from '@shared/__tests__';
import { futureDate, startOfToday } from '@shared/__tests__';
import { Priority, RecurrenceVo, Weight } from '../value-objects';
import { Task } from '../tasks.aggregate';

mockDate();

const createRecurrence = (startDate: string, deadline: string, frequency = RecurrenceFrequency.DAILY) =>
  RecurrenceVo.create({
    start: DateVo.create(startDate),
    end: DateVo.create(deadline),
    frequency,
  });

const createTask = (params?: { recurrence?: RecurrenceVo }) =>
  Task.create({
    userId: 1,
    name: Name.create('Task'),
    description: 'desc',
    priority: Priority.create(2),
    weight: Weight.create(10),
    recurrence: params?.recurrence,
  });

describe('Task aggregate', () => {
  it('creates NOT_STARTED task without recurrence', () => {
    const task = createTask();

    expect(task.status).toBe(TaskStatus.NOT_STARTED);
    expect(task.recurrence?.start).toBeUndefined();
    expect(task.recurrence?.end).toBeUndefined();
    expect(task.recurrence?.frequency).toBeUndefined();
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
    expect(task.recurrence?.frequency).toBe(RecurrenceFrequency.WEEKLY);
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
        recurrence: undefined,
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
