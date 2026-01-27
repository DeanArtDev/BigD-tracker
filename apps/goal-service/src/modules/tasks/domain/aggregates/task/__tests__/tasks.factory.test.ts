import { TaskStatus } from '@big-d/api-contracts';
import { TaskFactory } from '../tasks.factory';

const futureDate = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString();

describe('TaskFactory', () => {
  it('creates task with default priority and weight', () => {
    const task = TaskFactory.create({
      userId: 21,
      name: 'Factory task',
      description: 'Created by factory',
      startDate: futureDate(1),
      deadline: futureDate(2),
    });

    expect(task.priority).toBe(4);
    expect(task.weight).toBe(100);
    expect(task.status).toBe(TaskStatus.NOT_STARTED);
  });

  it('clones task into a draft', () => {
    const task = TaskFactory.create({
      userId: 22,
      name: 'Clone me',
      description: 'Clone from factory',
      startDate: futureDate(1),
      deadline: futureDate(2),
    });

    const clone = TaskFactory.clone(task);

    expect(clone.isDraft).toBe(true);
    expect(clone.status).toBe(TaskStatus.NOT_STARTED);
  });

  it('updates task fields through factory', () => {
    const task = TaskFactory.create({
      userId: 23,
      name: 'Update me',
      description: 'Before update',
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
      recurrence: 'monthly',
    });

    expect(task.name).toBe('Updated');
    expect(task.description).toBe('After update');
    expect(task.priority).toBe(2);
    expect(task.weight).toBe(70);
    expect(task.recurrence).toBe('monthly');
  });

  it('updates inbox task while keeping weight and recurrence', () => {
    const task = TaskFactory.create({
      userId: 24,
      name: 'Inbox',
      description: 'Before update',
      startDate: futureDate(1),
      deadline: futureDate(2),
      weight: 80,
      recurrence: 'weekly',
    });

    const updatedInboxTask = TaskFactory.updateInbox(task, {
      name: 'Inbox updated',
      description: 'After update',
      priority: 3,
      deadline: futureDate(4),
    });

    expect(updatedInboxTask.name).toBe('Inbox updated');
    expect(updatedInboxTask.description).toBe('After update');
    expect(updatedInboxTask.priority).toBe(3);
    expect(updatedInboxTask.weight).toBe(80);
    expect(updatedInboxTask.recurrence).toBe(undefined);
  });

  it('soft deletes task through factory', () => {
    const task = TaskFactory.create({
      userId: 25,
      name: 'Delete me',
      description: 'Remove later',
      startDate: futureDate(1),
      deadline: futureDate(2),
    });

    TaskFactory.deleteSoft(task);

    expect(task.status).toBe(TaskStatus.DELETED);
  });

  it('assigns task to group via factory', () => {
    const task = TaskFactory.create({
      userId: 26,
      name: 'Assign me',
      description: 'Move to inbox',
      startDate: futureDate(1),
      deadline: futureDate(2),
    });

    TaskFactory.assignToGroup(task, 'IN_BOX');

    expect(task.status).toBe(TaskStatus.NOT_STARTED);
  });
});
