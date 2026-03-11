import { describe, expect, it } from 'vitest';
import { TimezoneVo } from '../timezone-vo';
import { ExceptionInvalidInvariant } from '../exceptions';

type InvalidInvariantError = InstanceType<typeof ExceptionInvalidInvariant>;

describe('TimezoneVo', () => {
  it('creates from valid IANA timezone', () => {
    const timezone = TimezoneVo.create('Asia/Novosibirsk');

    expect(timezone.value).toBe('Asia/Novosibirsk');
  });

  it('throws for invalid timezone', () => {
    try {
      TimezoneVo.create('Mars/Olympus');
      throw new Error('Expected TimezoneVo.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe('Timezone: Mars/Olympus is invalid');
      expect((error as InvalidInvariantError).details.field).toBe('timezone');
    }
  });

  it('compares equality', () => {
    const first = TimezoneVo.create('UTC');
    const second = TimezoneVo.create('UTC');
    const third = TimezoneVo.create('America/New_York');

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });
});
