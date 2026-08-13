import { describe, expect, it } from 'vitest';
import { timeAndDate } from './index';

describe('timeAndDate', () => {
  it('initializes the configured dayjs plugins', () => {
    const value = timeAndDate('2026-08-14T10:00:00Z');

    expect(typeof value.isToday).toBe('function');
    expect(typeof value.isTomorrow).toBe('function');
    expect(typeof value.isYesterday).toBe('function');
    expect(typeof value.isLessThan24HoursLeft).toBe('function');
    expect(typeof value.isBetween).toBe('function');
    expect(typeof value.isSameOrAfter).toBe('function');
    expect(typeof value.isSameOrBefore).toBe('function');
    expect(typeof value.utc).toBe('function');
    expect(typeof value.tz).toBe('function');
    expect(typeof value.toObject).toBe('function');
  });

  it('keeps dayjs min and max extensions available', () => {
    const first = timeAndDate('2026-01-01');
    const second = timeAndDate('2026-01-02');

    expect(timeAndDate.min(first, second).isSame(first)).toBe(true);
    expect(timeAndDate.max(first, second).isSame(second)).toBe(true);
  });

  it('detects dates less than 24 hours in the future', () => {
    expect(timeAndDate().add(1, 'hour').isLessThan24HoursLeft()).toBe(true);
    expect(timeAndDate().subtract(1, 'hour').isLessThan24HoursLeft()).toBe(false);
    expect(timeAndDate('invalid').isLessThan24HoursLeft()).toBe(false);
  });
});
