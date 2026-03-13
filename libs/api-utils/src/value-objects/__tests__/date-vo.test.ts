import { describe, expect, it, vi } from 'vitest';
import { DateVo } from '../date-vo';
import { ExceptionInvalidInvariant } from '../exceptions';

type InvalidInvariantError = InstanceType<typeof ExceptionInvalidInvariant>;

describe('DateVo', () => {
  it('creates from string', () => {
    const dateVo = DateVo.create('2024-05-01T10:11');

    expect(dateVo.value).toBe('2024-05-01T10:11');
  });

  it('creates from timestamp number', () => {
    const dateVo = DateVo.create(Date.UTC(2024, 4, 1, 10, 11, 0, 0));

    expect(dateVo.value).toBe('2024-05-01T10:11');
  });

  it('restores from ISO date with timezone and normalizes to DateVo format', () => {
    const dateVo = DateVo.restore('2024-05-01T10:11:12.000Z');

    expect(dateVo.value).toBe('2024-05-01T10:11');
  });

  it('restores from timestamp number and normalizes to DateVo format', () => {
    const dateVo = DateVo.restore(Date.UTC(2024, 4, 1, 10, 11, 12, 0));

    expect(dateVo.value).toBe('2024-05-01T10:11');
  });

  it('creates now instance', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-12T11:34:37.262Z'));

    try {
      const now = DateVo.now();

      expect(now.value).toBe('2026-03-12T11:34');
    } finally {
      vi.useRealTimers();
    }
  });

  it('formats date input to DateVo format in UTC', () => {
    expect(DateVo.format(new Date('2024-05-01T10:11:12.000Z'))).toBe('2024-05-01T10:11');
    expect(DateVo.format('2024-05-01T10:11:12.000Z')).toBe('2024-05-01T10:11');
  });

  it('returns timestamp', () => {
    const dateVo = DateVo.create('2024-05-01T10:11');

    expect(dateVo.timestamp).toBe(Date.UTC(2024, 4, 1, 10, 11, 0, 0));
  });

  it('throws for date with timezone', () => {
    try {
      DateVo.create('2024-05-01T10:11:12.000Z');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe(
        'DateVo must be in format YYYY-MM-DDTHH:mm, but got: 2024-05-01T10:11:12.000Z',
      );
      expect((error as InvalidInvariantError).details.field).toBe('date');
    }
  });

  it('throws for invalid format', () => {
    try {
      DateVo.create('invalid-format');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe('Date: invalid-format is invalid');
      expect((error as InvalidInvariantError).details.field).toBe('date');
    }
  });

  it('converts date to timezone', () => {
    const dateVo = DateVo.restore('2024-05-01T10:11:00.000Z');

    expect(dateVo.tz('Asia/Novosibirsk')).toBe('2024-05-01T17:11:00+07:00');
  });

  it('compares equality', () => {
    const first = DateVo.create('2024-05-01T10:11');
    const second = DateVo.create('2024-05-01T10:11');
    const third = DateVo.create('2024-05-02T10:11');

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });

  it('checks relative ordering', () => {
    const base = DateVo.create('2024-05-01T10:11');

    expect(base.isBefore('2024-05-01T10:12')).toBe(true);
    expect(base.isAfter('2024-05-01T10:10')).toBe(true);
  });

  it('checks relative ordering against DateVo and timestamp', () => {
    const base = DateVo.create('2024-05-01T10:11');

    expect(base.isBefore(DateVo.create('2024-05-01T10:12'))).toBe(true);
    expect(base.isAfter(Date.UTC(2024, 4, 1, 10, 10, 0, 0))).toBe(true);
  });
});
