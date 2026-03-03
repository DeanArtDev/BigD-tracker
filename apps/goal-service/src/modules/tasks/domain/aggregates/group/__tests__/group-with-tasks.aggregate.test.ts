import { GroupStatus, TaskStatus } from '@big-d/api-contracts';
import { Name } from '@big-d/api-utils';
import { getTask } from '@shared/__tests__/entities';
import { Group } from '../group.aggregate';
import { GroupWithTasks } from '../group-with-tasks.aggregate';
import { DescriptionVo, ProgressVo } from '../../value-objects';

describe('GroupWithTasks aggregate', () => {
  const buildGroup = (status: GroupStatus) =>
    Group.restore({
      id: 101,
      userId: 55,
      name: Name.create('Group A'),
      description: DescriptionVo.create('Description'),
      progress: ProgressVo.create(20),
      status,
    });

  const buildTask = (id: number) =>
    getTask({
      id,
      userId: 55,
      name: `Task ${id}`,
      priority: 1,
      weight: 10,
      status: TaskStatus.NOT_STARTED,
    });

  it('creates and exposes group data with tasks', () => {
    const group = buildGroup(GroupStatus.NOT_STARTED);
    const tasks = [buildTask(1)];

    const aggregate = GroupWithTasks.create({ group, tasks });

    expect(aggregate.id).toBe(101);
    expect(aggregate.userId).toBe(55);
    expect(aggregate.name).toBe('Group A');
    expect(aggregate.description).toBe('Description');
    expect(aggregate.progress).toBe(ProgressVo.defaultValue().value);
    expect(aggregate.status).toBe(GroupStatus.NOT_STARTED);
    expect(aggregate.tasks).toHaveLength(1);
  });

  it('replaces group and tasks', () => {
    const group = buildGroup(GroupStatus.NOT_STARTED);
    const aggregate = GroupWithTasks.create({ group, tasks: [] });

    const newTasks = [buildTask(2), buildTask(3)];

    aggregate.replace({
      group: (current) =>
        Group.restore({
          id: current.id,
          userId: current.userId,
          name: Name.create('Updated'),
          description: DescriptionVo.create('Updated description'),
          progress: ProgressVo.create(30),
          status: GroupStatus.NOT_STARTED,
        }),
      tasks: newTasks,
    });

    expect(aggregate.name).toBe('Updated');
    expect(aggregate.description).toBe('Updated description');
    expect(aggregate.tasks).toHaveLength(2);
  });

  it('restores group with tasks', () => {
    const group = buildGroup(GroupStatus.NOT_STARTED);
    const tasks = [buildTask(4)];

    const aggregate = GroupWithTasks.restore({ group, tasks });

    expect(aggregate.tasks).toHaveLength(1);
    expect(aggregate.status).toBe(GroupStatus.NOT_STARTED);
  });

  it('rejects delete when tasks remain', () => {
    const group = buildGroup(GroupStatus.NOT_STARTED);
    const aggregate = GroupWithTasks.create({ group, tasks: [buildTask(5)] });

    expect(() => aggregate.delete()).toThrow();
  });

  it('delegates delete to group when tasks are empty', () => {
    const group = buildGroup(GroupStatus.NOT_STARTED);
    const aggregate = GroupWithTasks.create({ group, tasks: [] });

    expect(() => aggregate.delete()).not.toThrow();
  });

  it('propagates group delete errors when done', () => {
    const group = buildGroup(GroupStatus.DONE);
    const aggregate = GroupWithTasks.create({ group, tasks: [] });

    expect(() => aggregate.delete()).toThrow();
  });
});
