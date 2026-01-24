import { GroupStatus } from '@big-d/api-contracts';
import { Name } from '@big-d/api-utils';
import { DescriptionVo, ProgressVo } from '@/modules/tasks/domain';
import { Group } from '../group.aggregate';

describe('Group aggregate', () => {
  it('creates group with defaults', () => {
    const group = Group.create({
      userId: 10,
      name: Name.create('Sprint goals'),
      description: DescriptionVo.create('Plan the sprint'),
    });

    expect(group.id).toBeNaN();
    expect(group.userId).toBe(10);
    expect(group.name).toBe('Sprint goals');
    expect(group.description).toBe('Plan the sprint');
    expect(group.status).toBe(GroupStatus.NOT_STARTED);
    expect(group.progress).toBe(ProgressVo.defaultValue().value);
  });

  it('replaces group fields when allowed', () => {
    const group = Group.create({
      userId: 11,
      name: Name.create('Old name'),
      description: DescriptionVo.create('Old description'),
    });

    group.replace({
      name: Name.create('New name'),
      description: DescriptionVo.create('New description'),
    });

    expect(group.name).toBe('New name');
    expect(group.description).toBe('New description');
  });

  it('rejects replace for done groups', () => {
    const group = Group.restore({
      id: 41,
      userId: 13,
      name: Name.create('Restored'),
      description: DescriptionVo.create('From storage'),
      progress: ProgressVo.create(75),
      status: GroupStatus.DONE,
    });

    expect(() =>
      group.replace({
        name: Name.create('Updated'),
        description: DescriptionVo.create('Should fail'),
      }),
    ).toThrow();
  });

  it('restores group identity while keeping defaults', () => {
    const group = Group.restore({
      id: 41,
      userId: 13,
      name: Name.create('Restored'),
      description: DescriptionVo.create('From storage'),
      progress: ProgressVo.create(75),
      status: GroupStatus.DONE,
    });

    expect(group.id).toBe(41);
    expect(group.userId).toBe(13);
    expect(group.name).toBe('Restored');
    expect(group.description).toBe('From storage');
    expect(group.status).toBe(GroupStatus.DONE);
    expect(group.progress).toBe(ProgressVo.defaultValue().value);
  });

  it('allows delete when group is not done', () => {
    const group = Group.restore({
      id: 44,
      userId: 14,
      name: Name.create('Active group'),
      description: DescriptionVo.create('On going'),
      progress: ProgressVo.create(10),
      status: GroupStatus.NOT_STARTED,
    });

    expect(() => group.delete()).not.toThrow();
  });

  it('rejects delete when group is done', () => {
    const group = Group.restore({
      id: 45,
      userId: 14,
      name: Name.create('Done group'),
      description: DescriptionVo.create('Finished'),
      progress: ProgressVo.create(100),
      status: GroupStatus.DONE,
    });

    expect(() => group.delete()).toThrow();
  });
});
