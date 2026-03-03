import { RRule } from 'rrule';

describe('Task override service', () => {
  test('rrule success', () => {
    const rule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [RRule.MO, RRule.SA],
      dtstart: new Date('2026-02-28T17:00:00.000Z'),
      until: new Date('2026-03-07T16:59:59.000Z'),
    });

    expect(rule.all().map((d) => d.toISOString())).toEqual([
      '2026-02-28T17:00:00.000Z',
      '2026-03-02T17:00:00.000Z',
    ]);
    expect(rule.all()).toEqual([
      new Date('2026-02-28T17:00:00.000Z'),
      new Date('2026-03-02T17:00:00.000Z'),
    ]);
  });
});
