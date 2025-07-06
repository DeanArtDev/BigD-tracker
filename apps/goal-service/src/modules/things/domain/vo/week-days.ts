import { BaseValueObject } from '@big-d/api-utils';
import { isEqual } from 'lodash-es';

class WeekDays implements BaseValueObject<WeekDays> {
  #value: number[];
  private constructor(value: number[]) {
    this.#value = value;
    Object.freeze(this);
  }

  get value(): number[] {
    return this.#value;
  }

  public static create(value: number[]): WeekDays {
    if (value.length <= 0) {
      throw new Error('WeekDays must not be empty');
    }

    for (const number of value) {
      if (number < 0 || number > 6) {
        throw new Error('WeekDays available value range is from 0 to 6');
      }
    }

    return new WeekDays(value);
  }

  public static restore(value: number[]): WeekDays {
    return new WeekDays(value);
  }

  public equals(other: WeekDays): boolean {
    if (this.#value.length !== other.value.length) {
      return false;
    }
    return isEqual(this.#value, other.value);
  }
}

export { WeekDays };
