import { TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { Priority } from '../../value-objects/priority.vo';
import { Weight } from '../../value-objects/weight.vo';
import { Task } from './tasks.aggregate';

const futureDate = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString();

const buildCreateInput = () => ({
  userId: 42,
  name: Name.create('Write tests'),
  description: 'Add aggregate tests',
  priority: Priority.create(2),
  weight: Weight.create(80),
  startDate: DateVo.create(futureDate(1)),
  deadline: DateVo.create(futureDate(2)),
  recurrence: 'weekly',
});

const pastDate = (offsetDays: number) =>
  new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000).toISOString();

describe('Task aggregate', () => {
  it('creates task with default status and exposes state', () => {
    const task = Task.create(buildCreateInput());

    expect(task.isDraft).toBe(true);
    expect(task.status).toBe(TaskStatus.NOT_STARTED);
    expect(task.name).toBe('Write tests');
    expect(task.description).toBe('Add aggregate tests');
    expect(task.priority).toBe(2);
    expect(task.weight).toBe(80);
    expect(task.recurrence).toBe('weekly');
  });

  it('replace task fields', () => {
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

  it('rejects creation with past start date', () => {
    expect(() =>
      Task.create({
        ...buildCreateInput(),
        startDate: DateVo.create(pastDate(1)),
      }),
    ).toThrow();
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

  it('deletes task softly when allowed', () => {
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

  it('assigns task back to not started when moving to inbox', () => {
    const task = Task.restore({
      id: 12,
      userId: 15,
      name: Name.create('Inbox task'),
      description: 'Move back',
      priority: Priority.create(2),
      weight: Weight.create(40),
      status: TaskStatus.IN_PROGRESS,
    });

    task.assignToGroup(TaskStatus.NOT_STARTED);

    expect(task.status).toBe(TaskStatus.NOT_STARTED);
  });
});
