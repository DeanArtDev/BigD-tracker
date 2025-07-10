import { ThingEntity } from '@/modules/things/domain';
import { Name, Result } from '@big-d/api-utils';
import { GroupEntity } from '../group.entity';

const createThing = (partial: Partial<ThingEntity>): ThingEntity => {
  return ThingEntity.restore({
    id: partial.id ?? 1,
    groupId: partial.groupId ?? 1,
    name: Name.create(partial.name ?? 'Group1'),
    position: partial.position ?? 1,
    result: Result.create(partial.result ?? 0),
    userId: 1,
  });
};

describe('GroupEntity', () => {
  it('should have result 0 when there are no things in the group', () => {
    const group = GroupEntity.create({
      userId: 1,
      name: Name.create('Group'),
      position: 1,
    });

    expect(group.result).toBe(0);
  });

  it('should have result 0 when all things are not finalized', () => {
    const group = GroupEntity.create({
      userId: 1,
      name: Name.create('Group'),
      position: 1,
    });
    group.setThings([createThing({ groupId: group.id })]);

    expect(group.result).toBe(0);
  });

  it('should have result 100 when all things are finalized with result 100', () => {
    const group = GroupEntity.create({
      userId: 1,
      name: Name.create('Group'),
      position: 1,
    });
    group.setThings([
      createThing({ groupId: group.id, result: 100 }),
      createThing({ groupId: group.id, result: 100 }),
    ]);

    expect(group.result).toBe(100);
  });

  it('should correctly calculate average result when some things are partially completed', () => {
    const group = GroupEntity.create({
      userId: 1,
      name: Name.create('Group'),
      position: 1,
    });
    group.setThings([
      createThing({ groupId: group.id, result: 100 }),
      createThing({ groupId: group.id, result: 40 }),
    ]);

    expect(group.result).toBeCloseTo(70, 2);
  });

  it('should correctly calculate average result for multiple partially completed things', () => {
    const group = GroupEntity.create({
      userId: 1,
      name: Name.create('Group'),
      position: 1,
    });
    group.setThings([
      createThing({ groupId: group.id, result: 100 }),
      createThing({ groupId: group.id, result: 50 }),
      createThing({ groupId: group.id, result: 20 }),
    ]);

    expect(group.result).toBeCloseTo(56.7, 2);
  });

  it('should correctly calculate result when some things are finalized and some are not', () => {
    const group = GroupEntity.create({
      userId: 1,
      name: Name.create('Group'),
      position: 1,
    });
    group.setThings([
      createThing({ groupId: group.id, result: 70 }),
      createThing({ groupId: group.id, result: 30 }),
      createThing({ groupId: group.id, result: 20 }),
    ]);

    expect(group.result).toBeCloseTo(40, 2);
  });

  it('should correctly calculate result when all things have equal partial progress', () => {
    const group = GroupEntity.create({
      userId: 1,
      name: Name.create('Group'),
      position: 1,
    });
    group.setThings([
      createThing({ groupId: group.id, result: 25 }),
      createThing({ groupId: group.id, result: 25 }),
      createThing({ groupId: group.id, result: 25 }),
      createThing({ groupId: group.id, result: 25 }),
    ]);

    expect(group.result).toBeCloseTo(25, 2);
  });
});
