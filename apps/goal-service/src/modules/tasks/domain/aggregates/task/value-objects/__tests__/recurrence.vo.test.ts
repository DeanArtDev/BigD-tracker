import { RecurrenceFrequency } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { futureDate, pastDate, startOfToday } from '@shared/__tests__';
import { RecurrenceVo } from '../recurrence.vo';

describe('RecurrenceVo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates recurrence when dates are valid', () => {
    const recurrence = RecurrenceVo.create({
      frequency: RecurrenceFrequency.DAILY,
      start: DateVo.create('2023-01-02T00:00'),
      end: DateVo.create('2023-01-03T00:00'),
    });

    expect(recurrence.value.frequency).toBe(RecurrenceFrequency.DAILY);
    expect(recurrence.value.start?.value).toBe('2023-01-02T00:00');
    expect(recurrence.value.end?.value).toBe('2023-01-03T00:00');
  });

  it('rejects past deadline', () => {
    expect(() =>
      RecurrenceVo.create({
        start: DateVo.create(futureDate(1)),
        end: DateVo.create(pastDate(1)),
      }),
    ).toThrow();
  });

  it('rejects deadline at start of today when startDate is after deadline', () => {
    expect(() =>
      RecurrenceVo.create({
        start: DateVo.create(futureDate(1)),
        end: DateVo.create(startOfToday()),
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
      start: DateVo.create('2023-01-02T00:00'),
      end: DateVo.create('2023-01-03T00:00'),
    });
    const right = RecurrenceVo.create({
      frequency: RecurrenceFrequency.WEEKLY,
      start: DateVo.create('2023-01-02T00:00'),
      end: DateVo.create('2023-01-03T00:00'),
    });

    expect(left.equals(right)).toBe(true);
  });
});
