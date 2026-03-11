import { describe, expect, it } from 'vitest';
import { Result } from '../result';
import { ExceptionInvalidInvariant } from '../exceptions';

type InvalidInvariantError = InstanceType<typeof ExceptionInvalidInvariant>;

describe('Result', () => {
  it('creates when within range', () => {
    const result = Result.create(50);

    expect(result.value).toBe(50);
  });

  it('throws when outside range', () => {
    try {
      Result.create(-1);
      throw new Error('Expected Result.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe('Result available value range is from 0 to 100');
      expect((error as InvalidInvariantError).details.field).toBe('result');
    }

    try {
      Result.create(101);
      throw new Error('Expected Result.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe('Result available value range is from 0 to 100');
      expect((error as InvalidInvariantError).details.field).toBe('result');
    }
  });

  it('compares equality', () => {
    const first = Result.create(80);
    const second = Result.create(80);
    const third = Result.create(60);

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });
});
