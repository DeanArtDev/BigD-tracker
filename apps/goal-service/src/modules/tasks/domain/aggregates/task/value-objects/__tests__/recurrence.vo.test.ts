import { RecurrenceFrequency } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { mockDate } from '@shared/__tests__';
import {
  futureDate,
  oneMsBeforeStartOfToday,
  pastDate,
  startOfToday,
} from '@shared/__tests__/time/helpers';
import { RecurrenceVo } from '../recurrence.vo';

mockDate();

describe('RecurrenceVo', () => {
  it('creates recurrence when dates are valid', () => {
    const recurrence = RecurrenceVo.create({
      frequency: RecurrenceFrequency.DAILY,
      start: DateVo.create(futureDate(1)),
      end: DateVo.create(futureDate(2)),
    });

    expect(recurrence.value.frequency).toBe(RecurrenceFrequency.DAILY);
    expect(recurrence.value.start?.value).toBe(futureDate(1));
    expect(recurrence.value.end?.value).toBe(futureDate(2));
  });

  it.skip('rejects past startDate', () => {
    expect(() =>
      RecurrenceVo.create({
        start: DateVo.create(pastDate(1)),
        end: DateVo.create(futureDate(1)),
      }),
    ).toThrow();
  });

  it('rejects past deadline', () => {
    expect(() =>
      RecurrenceVo.create({
        start: DateVo.create(futureDate(1)),
        end: DateVo.create(pastDate(1)),
      }),
    ).toThrow();
  });

  it('allows boundary at start of today for startDate', () => {
    expect(() =>
      RecurrenceVo.create({
        start: DateVo.create(startOfToday()),
        end: DateVo.create(futureDate(1)),
      }),
    ).not.toThrow();
  });

  it('rejects deadline at start of today when startDate is after deadline', () => {
    expect(() =>
      RecurrenceVo.create({
        start: DateVo.create(futureDate(1)),
        end: DateVo.create(startOfToday()),
      }),
    ).toThrow();
  });

  it.skip('rejects values before start of today boundary', () => {
    expect(() =>
      RecurrenceVo.create({
        start: DateVo.create(oneMsBeforeStartOfToday()),
        end: DateVo.create(futureDate(1)),
      }),
    ).toThrow();

    expect(() =>
      RecurrenceVo.create({
        start: DateVo.create(futureDate(1)),
        end: DateVo.create(oneMsBeforeStartOfToday()),
      }),
    ).toThrow();
  });

  it('rejects when startDate is equal to deadline', () => {
    const date = DateVo.create(futureDate(1));

    expect(() =>
      RecurrenceVo.create({
        start: date,
        end: date,
      }),
    ).toThrow();
  });

  it('rejects when startDate is after deadline', () => {
    expect(() =>
      RecurrenceVo.create({
        start: DateVo.create(futureDate(2)),
        end: DateVo.create(futureDate(1)),
      }),
    ).toThrow();
  });

  it('supports equality by value', () => {
    const left = RecurrenceVo.create({
      frequency: RecurrenceFrequency.WEEKLY,
      start: DateVo.create(futureDate(1)),
      end: DateVo.create(futureDate(2)),
    });
    const right = RecurrenceVo.create({
      frequency: RecurrenceFrequency.WEEKLY,
      start: DateVo.create(futureDate(1)),
      end: DateVo.create(futureDate(2)),
    });

    expect(left.equals(right)).toBe(true);
  });
});
