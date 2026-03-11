import { describe, expect, it } from 'vitest';
import { YearmonthsVo } from '../yearmonths-vo';
import { ExceptionInvalidInvariant } from '../exceptions';

type InvalidInvariantError = InstanceType<typeof ExceptionInvalidInvariant>;

describe('YearmonthsVo', () => {
  it('creates from valid yearmonths array', () => {
    const vo = YearmonthsVo.create([12, 1, 6]);

    expect(vo.value).toEqual([1, 6, 12]);
  });

  it('throws for value outside valid range', () => {
    try {
      YearmonthsVo.create([1, 13]);
      throw new Error('Expected YearmonthsVo.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe('Yearmonths value 13 is out of range 1..12');
      expect((error as InvalidInvariantError).details.field).toBe('yearmonths');
    }
  });

  it('compares equality', () => {
    const first = YearmonthsVo.create([6, 1]);
    const second = YearmonthsVo.create([1, 6]);
    const third = YearmonthsVo.create([1, 7]);

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });
});
