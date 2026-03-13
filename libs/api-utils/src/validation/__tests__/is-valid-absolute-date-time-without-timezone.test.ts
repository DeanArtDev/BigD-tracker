import { describe, expect, it } from 'vitest';
import { isValidAbsoluteDateTimeWithoutTimezone } from '../is-valid-absolute-date-time-without-timezone';

describe('isValidAbsoluteDateTimeWithoutTimezone', () => {
  it('returns true for valid datetime without timezone', () => {
    expect(isValidAbsoluteDateTimeWithoutTimezone('2026-03-12T02:03')).toBe(true);
  });

  it('returns false for datetime with timezone', () => {
    expect(isValidAbsoluteDateTimeWithoutTimezone('2026-03-12T02:03:00.000Z')).toBe(false);
  });

  it('returns false for invalid calendar date', () => {
    expect(isValidAbsoluteDateTimeWithoutTimezone('2026-02-31T02:03')).toBe(false);
  });
});
