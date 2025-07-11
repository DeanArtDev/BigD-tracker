import { ThingEntity } from '../thing.entity';
import { Name, DateVo, Result } from '@big-d/api-utils';
import { Priority } from '../vo/priority';
import { WeekDays } from '../vo/week-days';

describe('ThingEntity', () => {
  it('creates and finishes thing', () => {
    const thing = ThingEntity.create({
      userId: 1,
      groupId: 1,
      name: Name.create('T'),
      position: 0,
    });
    thing.finish({ endDate: DateVo.create(new Date().toISOString()), result: Result.create(50) });
    expect(thing.isFinalized).toBe(true);
  });
});

describe('Priority', () => {
  it('creates and compares', () => {
    const p1 = Priority.create(1);
    const p2 = Priority.restore(1);
    expect(p1.equals(p2)).toBe(true);
  });
});

describe('WeekDays', () => {
  it('creates and compares', () => {
    const w = WeekDays.create([1, 2]);
    const r = WeekDays.restore([1, 2]);
    expect(w.equals(r)).toBe(true);
  });
});
