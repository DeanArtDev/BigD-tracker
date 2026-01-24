import { TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { Priority } from '../../../value-objects/priority.vo';
import { Weight } from '../../../value-objects/weight.vo';
import { Task } from '../tasks.aggregate';

const futureDate = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString();

const pastDate = (offsetDays: number) =>
  new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000).toISOString();

const buildCreateInput = (overrides?: Partial<Parameters<typeof Task.create>[0]>) => ({
  userId: 42,
  name: Name.create('Write tests'),
  description: 'Add aggregate tests',
  priority: Priority.create(2),
  weight: Weight.create(80),
  startDate: DateVo.create(futureDate(1)),
  deadline: DateVo.create(futureDate(2)),
  recurrence: 'weekly',
  ...overrides,
});

describe('Task aggregate', () => {
  it('creates task with default status and exposes state', () => {
    const task = Task.create(buildCreateInput());

    expect(task.isDraft).toBe(true);
    expect(task.status).toBe(TaskStatus.NOT_STARTED);
    expect(task.name).toBe('Write tests');
    expect(task.description).toBe('Add aggregate tests');
    expect(task.priority).toBe(2);
    expect(task.weight).toBe(80);
    expect(task.startDate).toBeDefined();
    expect(task.deadline).toBeDefined();
    expect(task.recurrence).toBe('weekly');
  });

  it('rejects creation with past start date', () => {
    expect(() =>
      Task.create(
        buildCreateInput({
          startDate: DateVo.create(pastDate(1)),
        }),
      ),
    ).toThrow();
  });

  it('rejects creation with deadline in the past', () => {
    expect(() =>
      Task.create(
        buildCreateInput({
          deadline: DateVo.create(pastDate(1)),
        }),
      ),
    ).toThrow();
  });

  it('rejects creation when start date is after deadline', () => {
    expect(() =>
      Task.create(
        buildCreateInput({
          startDate: DateVo.create(futureDate(3)),
          deadline: DateVo.create(futureDate(2)),
        }),
      ),
    ).toThrow();
  });

  it('restores persisted task data', () => {
    const task = Task.restore({
      id: 13,
      userId: 8,
      name: Name.create('Restored task'),
      description: 'From storage',
      priority: Priority.create(1),
      weight: Weight.create(10),
      status: TaskStatus.IN_PROGRESS,
      startDate: DateVo.create(futureDate(2)),
      endDate: DateVo.create(futureDate(3)),
      deadline: DateVo.create(futureDate(4)),
      cancelReason: 'None',
      recurrence: 'daily',
    });

    expect(task.isDraft).toBe(false);
    expect(task.id).toBe(13);
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(task.startDate).toBeDefined();
    expect(task.endDate).toBeDefined();
    expect(task.deadline).toBeDefined();
    expect(task.cancelReason).toBe('None');
    expect(task.recurrence).toBe('daily');
  });

  it('replaces task fields when allowed', () => {
    const task = Task.create(buildCreateInput());

    task.replace({
      name: Name.create('Refine tests'),
      description: 'Update aggregate tests',
      priority: Priority.create(3),
      weight: Weight.create(50),
      startDate: DateVo.create(futureDate(3)),
      deadline: DateVo.create(futureDate(4)),
      recurrence: 'monthly',
    });

    expect(task.name).toBe('Refine tests');
    expect(task.description).toBe('Update aggregate tests');
    expect(task.priority).toBe(3);
    expect(task.weight).toBe(50);
    expect(task.recurrence).toBe('monthly');
  });

  it('rejects updates for completed tasks', () => {
    const task = Task.restore({
      id: 13,
      userId: 8,
      name: Name.create('Completed task'),
      description: 'Cannot update',
      priority: Priority.create(1),
      weight: Weight.create(10),
      status: TaskStatus.COMPLETED,
    });

    expect(() =>
      task.replace({
        name: Name.create('Should fail'),
        description: 'No updates',
        priority: Priority.create(2),
        weight: Weight.create(20),
        startDate: DateVo.create(futureDate(2)),
        deadline: DateVo.create(futureDate(3)),
        recurrence: 'weekly',
      }),
    ).toThrow();
  });

  it('rejects updates after end date is set', () => {
    const task = Task.restore({
      id: 14,
      userId: 8,
      name: Name.create('Ended task'),
      description: 'Cannot update',
      priority: Priority.create(1),
      weight: Weight.create(10),
      status: TaskStatus.IN_PROGRESS,
      endDate: DateVo.create(futureDate(2)),
    });

    expect(() =>
      task.replace({
        name: Name.create('Should fail'),
        description: 'No updates',
        priority: Priority.create(2),
        weight: Weight.create(20),
        startDate: DateVo.create(futureDate(3)),
        deadline: DateVo.create(futureDate(4)),
        recurrence: 'weekly',
      }),
    ).toThrow();
  });

  it('rejects updates when dates are invalid', () => {
    const task = Task.create(buildCreateInput());

    expect(() =>
      task.replace({
        name: Name.create('Invalid dates'),
        description: 'Bad order',
        priority: Priority.create(2),
        weight: Weight.create(20),
        startDate: DateVo.create(futureDate(5)),
        deadline: DateVo.create(futureDate(4)),
      }),
    ).toThrow();
  });

  it('soft deletes task when allowed', () => {
    const task = Task.restore({
      id: 10,
      userId: 7,
      name: Name.create('Cleanup'),
      description: 'Soft delete',
      priority: Priority.create(1),
      weight: Weight.create(20),
      status: TaskStatus.IN_PROGRESS,
    });

    task.deleteSoft();

    expect(task.status).toBe(TaskStatus.DELETED);
  });

  it('rejects soft delete for completed tasks', () => {
    const task = Task.restore({
      id: 11,
      userId: 7,
      name: Name.create('Cleanup'),
      description: 'Soft delete',
      priority: Priority.create(1),
      weight: Weight.create(20),
      status: TaskStatus.COMPLETED,
    });

    expect(() => task.deleteSoft()).toThrow();
  });

  it('assigns task back to not started when moving to inbox', () => {
    const task = Task.restore({
      id: 12,
      userId: 15,
      name: Name.create('Inbox task'),
      description: 'Move back',
      priority: Priority.create(2),
      weight: Weight.create(40),
      status: TaskStatus.IN_PROGRESS,
      startDate: DateVo.create(futureDate(2)),
      endDate: DateVo.create(futureDate(3)),
      recurrence: 'weekly',
    });

    task.assignToGroup(TaskStatus.NOT_STARTED);

    expect(task.status).toBe(TaskStatus.NOT_STARTED);
    expect(task.startDate).toBeUndefined();
    expect(task.endDate).toBeUndefined();
    expect(task.recurrence).toBeUndefined();
  });

  it('assigns task to another status without clearing dates', () => {
    const task = Task.restore({
      id: 15,
      userId: 15,
      name: Name.create('Assign task'),
      description: 'Move forward',
      priority: Priority.create(2),
      weight: Weight.create(40),
      status: TaskStatus.NOT_STARTED,
      startDate: DateVo.create(futureDate(1)),
      deadline: DateVo.create(futureDate(2)),
      recurrence: 'weekly',
    });

    task.assignToGroup(TaskStatus.IN_PROGRESS);

    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    expect(task.startDate).toBeDefined();
    expect(task.deadline).toBeDefined();
    expect(task.recurrence).toBe('weekly');
  });

  it('rejects assigning task in terminal status', () => {
    const task = Task.restore({
      id: 16,
      userId: 15,
      name: Name.create('Terminal task'),
      description: 'Cannot assign',
      priority: Priority.create(2),
      weight: Weight.create(40),
      status: TaskStatus.CANCELLED,
    });

    expect(() => task.assignToGroup(TaskStatus.NOT_STARTED)).toThrow();
  });

  it('allows unassigning when task is active', () => {
    const task = Task.restore({
      id: 17,
      userId: 15,
      name: Name.create('Unassign task'),
      description: 'Active',
      priority: Priority.create(2),
      weight: Weight.create(40),
      status: TaskStatus.IN_PROGRESS,
    });

    expect(() => task.unassignFromGroup()).not.toThrow();
  });

  it('rejects unassigning when task is terminal', () => {
    const task = Task.restore({
      id: 18,
      userId: 15,
      name: Name.create('Unassign task'),
      description: 'Cancelled',
      priority: Priority.create(2),
      weight: Weight.create(40),
      status: TaskStatus.ARCHIVED,
    });

    expect(() => task.unassignFromGroup()).toThrow();
  });

  it('resets status on clone for finished tasks', () => {
    const task = Task.restore({
      id: 11,
      userId: 9,
      name: Name.create('Wrap up'),
      description: 'Clone me',
      priority: Priority.create(4),
      weight: Weight.create(10),
      status: TaskStatus.COMPLETED,
    });

    const clone = task.clone();

    expect(clone.isDraft).toBe(true);
    expect(clone.status).toBe(TaskStatus.NOT_STARTED);
  });

  it('keeps status on clone for active tasks', () => {
    const task = Task.restore({
      id: 19,
      userId: 9,
      name: Name.create('Keep status'),
      description: 'Clone me',
      priority: Priority.create(4),
      weight: Weight.create(10),
      status: TaskStatus.IN_PROGRESS,
    });

    const clone = task.clone();

    expect(clone.status).toBe(TaskStatus.IN_PROGRESS);
  });
});
