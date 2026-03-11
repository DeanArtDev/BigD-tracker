import { describe, expect, it } from 'vitest';
import { DateVo } from '../date-vo';
import { ExceptionInvalidInvariant } from '../exceptions';

type InvalidInvariantError = InstanceType<typeof ExceptionInvalidInvariant>;

describe('DateVo', () => {
  it('creates from ISO string and normalizes milliseconds', () => {
    const dateVo = DateVo.create('2024-05-01T10:11:12.789Z');

    expect(dateVo.value).toBe('2024-05-01T10:11:12.000Z');
  });

  it('creates from Date instance', () => {
    const date = new Date('2024-05-01T10:11:12.345Z');
    const dateVo = DateVo.create(date);

    expect(dateVo.value).toBe('2024-05-01T10:11:12.000Z');
  });

  it('throws for non-ISO input', () => {
    try {
      DateVo.create('not-a-date');
      throw new Error('Expected DateVo.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe('Date: not-a-date has invalid format');
      expect((error as InvalidInvariantError).details.field).toBe('date');
    }
  });

  it('compares equality', () => {
    const first = DateVo.create('2024-05-01T10:11:12.000Z');
    const second = DateVo.create('2024-05-01T10:11:12.000Z');
    const third = DateVo.create('2024-05-02T10:11:12.000Z');

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });

  it('checks relative ordering', () => {
    const base = DateVo.create('2024-05-01T10:11:12.000Z');

    expect(base.isBefore('2024-05-01T10:11:13.000Z')).toBe(true);
    expect(base.isAfter('2024-05-01T10:11:11.000Z')).toBe(true);
  });
});
