import { GroupEntity } from '@/modules/groups/domain';
import { ThingEntity } from '@/modules/things/domain';
import { Name, Result } from '@big-d/api-utils';
import { GoalEntity } from '../goal.entity';

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

const createGroup = (partial: Partial<GroupEntity>): GroupEntity => {
  const group = GroupEntity.restore({
    id: partial.id ?? 1,
    goalId: partial.goalId ?? 1,
    name: Name.create(partial.name ?? 'Group1'),
    position: partial.position ?? 1,
    result: Result.create(partial.result ?? 0),
    userId: 1,
  });
  return group.setThings([createThing({ result: partial.result ?? 0, groupId: group.id })]);
};

describe('GoalEntity', () => {
  it('should have result 0 when there are no groups assigned to the goal', () => {
    const goal = GoalEntity.create({
      userId: 1,
      name: Name.create('Test Goal'),
    });

    expect(goal.result).toBe(0);
  });

  it('should have result 0 when all groups exist but none are finalized', () => {
    const goal = GoalEntity.create({
      userId: 1,
      name: Name.create('Test Goal'),
    });
    goal.setGroups([createGroup({ goalId: goal.id })]);

    expect(goal.result).toBe(0);
  });

  it('should have result 100 when all groups are finalized with 100 result', () => {
    const goal = GoalEntity.create({
      userId: 1,
      name: Name.create('Test Goal'),
    });
    goal.setGroups([
      createGroup({ result: 100, goalId: goal.id }),
      createGroup({ result: 100, goalId: goal.id }),
    ]);

    expect(goal.result).toBe(100);
  });

  it('should correctly calculate average result when groups have mixed progress', () => {
    const goal = GoalEntity.create({
      userId: 1,
      name: Name.create('Test Goal'),
    });
    goal.setGroups([
      createGroup({ result: 100, goalId: goal.id }),
      createGroup({ result: 40, goalId: goal.id }),
    ]);

    expect(goal.result).toBeCloseTo(70, 2);
  });

  it('should correctly calculate average result for multiple groups with partial completion', () => {
    const goal = GoalEntity.create({
      userId: 1,
      name: Name.create('Test Goal'),
    });
    goal.setGroups([
      createGroup({ result: 100, goalId: goal.id }),
      createGroup({ result: 50, goalId: goal.id }),
      createGroup({ result: 20, goalId: goal.id }),
    ]);

    expect(goal.result).toBeCloseTo(56.7, 2);
  });

  it('should correctly calculate average result when some groups are fully completed and some are partially completed', () => {
    const goal = GoalEntity.create({
      userId: 1,
      name: Name.create('Test Goal'),
    });
    goal.setGroups([
      createGroup({ result: 100, goalId: goal.id }),
      createGroup({ result: 50, goalId: goal.id }),
      createGroup({ result: 50, goalId: goal.id }),
    ]);

    expect(goal.result).toBeCloseTo(66.7, 2);
  });
});
