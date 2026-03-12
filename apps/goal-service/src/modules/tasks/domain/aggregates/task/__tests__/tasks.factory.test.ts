import { TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { futureDate } from '@shared/__tests__';
import { TaskFactory } from '../tasks.factory';
import { Task } from '../tasks.aggregate';
import { Priority, Weight } from '../value-objects';

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

  it('creates IN_PROGRESS task when startDate and deadline are provided', () => {
    const task = TaskFactory.create({
      userId: 22,
      name: 'Task with recurrence',
      startDate: futureDate(1),
      deadline: futureDate(2),
    });

    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(task.startDate).toBe(DateVo.create(futureDate(1)).value);
    expect(task.deadline).toBe(DateVo.create(futureDate(2)).value);
  });

  it('clones task into a draft', () => {
    const task = TaskFactory.create({
      userId: 23,
      name: 'Clone me',
      startDate: futureDate(1),
      deadline: futureDate(2),
    });

    const clone = TaskFactory.clone(task);

    expect(clone.isDraft).toBe(true);
    expect(clone.startDate).toBe(DateVo.create(futureDate(1)).value);
    expect(clone.deadline).toBe(DateVo.create(futureDate(2)).value);
    expect(clone.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('replaces task fields through factory', () => {
    const task = TaskFactory.create({
      userId: 24,
      name: 'Update me',
      startDate: futureDate(1),
      deadline: futureDate(2),
    });

    TaskFactory.replace(task, {
      name: 'Updated',
      description: 'After update',
      priority: 2,
      weight: 70,
      startDate: futureDate(3),
      deadline: futureDate(4),
    });

    expect(task.name).toBe('Updated');
    expect(task.description).toBe('After update');
    expect(task.priority).toBe(2);
    expect(task.weight).toBe(70);
    expect(task.startDate).toBe(DateVo.create(futureDate(3)).value);
    expect(task.deadline).toBe(DateVo.create(futureDate(4)).value);
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
    });

    const updated = TaskFactory.updateInbox(task, {
      name: 'Inbox updated',
      description: 'After update',
      priority: 3,
    });

    expect(updated.name).toBe('Inbox updated');
    expect(updated.description).toBe('After update');
    expect(updated.priority).toBe(3);
    expect(updated.weight).toBe(80);
  });
});
