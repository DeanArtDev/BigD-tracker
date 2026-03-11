import { BaseValueObject } from './base-value-object';
import { ExceptionInvalidInvariant } from './exceptions';

class TimezoneVo implements BaseValueObject {
  #state: string;

  private constructor(state: string) {
    this.#state = TimezoneVo.validate(state);
  }

  get value(): string {
    return this.#state;
  }

  public static create(timezone: string): TimezoneVo {
    return new TimezoneVo(timezone);
  }

  public static restore(timezone: string): TimezoneVo {
    return new TimezoneVo(timezone);
  }

  public equals(other: TimezoneVo): boolean {
    return this.value === other.value;
  }

  private static validate(timezone: string): string {
    try {
      return new Intl.DateTimeFormat('en-US', { timeZone: timezone }).resolvedOptions().timeZone;
    } catch {
      throw new ExceptionInvalidInvariant({
        message: `Timezone: ${timezone} is invalid`,
        field: 'timezone',
      });
    }
  }
}

export { TimezoneVo };
