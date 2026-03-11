import { describe, expect, it } from 'vitest';
import { MonthdaysVo } from '../monthdays-vo';
import { ExceptionInvalidInvariant } from '../exceptions';

type InvalidInvariantError = InstanceType<typeof ExceptionInvalidInvariant>;

describe('MonthdaysVo', () => {
  it('creates from valid monthdays array', () => {
    const vo = MonthdaysVo.create([31, 1, 15]);

    expect(vo.value).toEqual([1, 15, 31]);
  });

  it('throws for value outside valid range', () => {
    try {
      MonthdaysVo.create([0, 15]);
      throw new Error('Expected MonthdaysVo.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe('Monthdays value 0 is out of range 1..31');
      expect((error as InvalidInvariantError).details.field).toBe('monthdays');
    }
  });

  it('compares equality', () => {
    const first = MonthdaysVo.create([15, 1]);
    const second = MonthdaysVo.create([1, 15]);
    const third = MonthdaysVo.create([1, 16]);

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });
});
