import { describe, expect, it } from 'vitest';
import { Result } from '../result';

describe('Result', () => {
  it('creates when within range', () => {
    const result = Result.create(50);

    expect(result.value).toBe(50);
  });

  it('throws when outside range', () => {
    expect(() => Result.create(-1)).toThrowError('Result available value range');
    expect(() => Result.create(101)).toThrowError('Result available value range');
  });

  it('compares equality', () => {
    const first = Result.create(80);
    const second = Result.create(80);
    const third = Result.create(60);

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });
});
