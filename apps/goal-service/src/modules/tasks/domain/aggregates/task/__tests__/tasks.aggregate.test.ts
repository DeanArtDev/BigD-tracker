import { TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { mockDate } from '@shared/__tests__';
import { futureDate } from '@shared/__tests__';
import { Priority, Weight } from '../value-objects';
import { Task } from '../tasks.aggregate';

mockDate();

const createTask = (params?: { startDate?: string; deadline?: string; recurrenceId?: number }) =>
  Task.create({
    userId: 1,
    name: Name.create('Task'),
    description: 'desc',
    priority: Priority.create(2),
    weight: Weight.create(10),
    startDate: params?.startDate != null ? DateVo.create(params.startDate) : undefined,
    deadline: params?.deadline != null ? DateVo.create(params.deadline) : undefined,
    recurrenceId: params?.recurrenceId,
  });

describe('Task aggregate', () => {
  it('creates NOT_STARTED task without dates', () => {
    const task = createTask();

    expect(task.status).toBe(TaskStatus.NOT_STARTED);
    expect(task.startDate).toBeUndefined();
    expect(task.deadline).toBeUndefined();
  });

  it('restores task with dates', () => {
    const task = Task.restore({
      id: 10,
      userId: 1,
      name: Name.create('Restored'),
      description: 'desc',
      priority: Priority.create(2),
      weight: Weight.create(10),
      status: TaskStatus.NOT_STARTED,
      startDate: DateVo.create(futureDate(2)),
      deadline: DateVo.create(futureDate(3)),
    });

    expect(task.isDraft).toBe(false);
    expect(task.startDate).toBe(futureDate(2));
    expect(task.deadline).toBe(futureDate(3));
  });

  it('allows partial replace for COMPLETED when immutable fields are unchanged', () => {
    const task = Task.restore({
      id: 11,
      userId: 1,
      name: Name.create('Done'),
      description: 'desc',
      priority: Priority.create(2),
      weight: Weight.create(10),
      status: TaskStatus.COMPLETED,
      startDate: DateVo.create(futureDate(1)),
      deadline: DateVo.create(futureDate(2)),
    });

    expect(() =>
      task.replace({
        name: Name.create('Done updated'),
        description: 'updated',
        priority: Priority.create(2),
        weight: Weight.create(10),
        startDate: undefined,
        deadline: undefined,
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
      startDate: DateVo.create(futureDate(1)),
      deadline: DateVo.create(futureDate(2)),
    });

    expect(() =>
      task.replace({
        name: Name.create('Done updated'),
        description: 'updated',
        priority: Priority.create(1),
        weight: Weight.create(10),
        startDate: DateVo.create(futureDate(1)),
        deadline: DateVo.create(futureDate(2)),
      }),
    ).toThrow();
  });

  it('finishes task with COMPLETED when deadline is after finish date', () => {
    const task = Task.restore({
      id: 13,
      userId: 1,
      name: Name.create('To finish'),
      priority: Priority.create(2),
      weight: Weight.create(10),
      status: TaskStatus.IN_PROGRESS,
      startDate: DateVo.restore('2022-12-30T00:00:00.000Z'),
      deadline: DateVo.restore('2023-01-02T00:00:00.000Z'),
    });

    task.finish({ now: DateVo.restore('2023-01-01T00:00:00.000Z') });

    expect(task.status).toBe(TaskStatus.COMPLETED);
    expect(task.endDate).toBeDefined();
  });

  it('finishes task with OVERDUE when deadline is before finish date', () => {
    const task = Task.restore({
      id: 14,
      userId: 1,
      name: Name.create('To finish completed'),
      priority: Priority.create(2),
      weight: Weight.create(10),
      status: TaskStatus.IN_PROGRESS,
      startDate: DateVo.restore('2022-12-30T00:00:00.000Z'),
      deadline: DateVo.restore('2022-12-31T00:00:00.000Z'),
    });

    task.finish({ now: DateVo.restore('2023-01-01T00:00:00.000Z') });

    expect(task.status).toBe(TaskStatus.OVERDUE);
    expect(task.endDate).toBeDefined();
  });
});
