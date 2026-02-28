import { RecurrenceFrequency, TaskStatus } from '@big-d/api-contracts';
import { Name } from '@big-d/api-utils';
import { futureDate } from '@shared/__tests__/time/helpers';
import { TaskFactory } from '../tasks.factory';
import { Task } from '../tasks.aggregate';
import { Priority, RecurrenceVo, Weight } from '../value-objects';

describe('TaskFactory', () => {
  it('creates task with default priority and weight', () => {
    const task = TaskFactory.create({
      userId: 21,
      name: 'Factory task',
      description: 'Created by factory',
    });

    expect(task.priority).toBe(4);
    expect(task.weight).toBe(100);
    expect(task.status).toBe(TaskStatus.NOT_STARTED);
  });

  it('creates IN_PROGRESS task when recurrence and start/deadline are provided', () => {
    const task = TaskFactory.create({
      userId: 22,
      name: 'Task with recurrence',
      recurrence: {
        frequency: RecurrenceFrequency.DAILY,
        startDate: futureDate(1),
        deadline: futureDate(2),
      },
    });

    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(task.recurrence?.value.frequency).toBe(RecurrenceFrequency.DAILY);
  });

  it('clones task into a draft', () => {
    const task = TaskFactory.create({
      userId: 23,
      name: 'Clone me',
    });

    const clone = TaskFactory.clone(task);

    expect(clone.isDraft).toBe(true);
    expect(clone.status).toBe(TaskStatus.NOT_STARTED);
  });

  it('replaces task fields through factory when recurrence is valid', () => {
    const task = TaskFactory.create({
      userId: 24,
      name: 'Update me',
      recurrence: {
        frequency: RecurrenceFrequency.DAILY,
        startDate: futureDate(1),
        deadline: futureDate(2),
      },
    });

    TaskFactory.replace(task, {
      name: 'Updated',
      description: 'After update',
      priority: 2,
      weight: 70,
      recurrence: {
        frequency: RecurrenceFrequency.WEEKLY,
        startDate: futureDate(3),
        deadline: futureDate(4),
      },
    });

    expect(task.name).toBe('Updated');
    expect(task.description).toBe('After update');
    expect(task.priority).toBe(2);
    expect(task.weight).toBe(70);
    expect(task.recurrence?.value.frequency).toBe(RecurrenceFrequency.WEEKLY);
  });

  it('updates inbox task for partially replaceable status', () => {
    const task = Task.restore({
      id: 50,
      userId: 24,
      name: Name.create('Inbox'),
      description: 'Before update',
      priority: Priority.create(3),
      weight: Weight.create(80),
      status: TaskStatus.COMPLETED,
      recurrence: RecurrenceVo.create({
        frequency: undefined,
        deadline: undefined,
        startDate: undefined,
      }),
    });

    const updated = TaskFactory.updateInbox(task, {
      name: 'Inbox updated',
      description: 'After update',
      priority: 3,
      recurrence: { deadline: futureDate(4) },
    });

    expect(updated.name).toBe('Inbox updated');
    expect(updated.description).toBe('After update');
    expect(updated.priority).toBe(3);
    expect(updated.weight).toBe(80);
  });
});
