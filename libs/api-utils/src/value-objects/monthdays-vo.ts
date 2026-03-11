import { BaseValueObject } from './base-value-object';
import { ExceptionInvalidInvariant } from './exceptions';

class MonthdaysVo implements BaseValueObject {
  #state: number[];

  private constructor(state: number[]) {
    this.#state = MonthdaysVo.#normalize(state);
  }

  get value(): number[] {
    return this.#state;
  }

  public static create(values: number[]): MonthdaysVo {
    if (!Array.isArray(values)) {
      throw new ExceptionInvalidInvariant({
        message: 'Monthdays must be an array',
        field: 'monthdays',
      });
    }

    const invalidValue = values.find((value) => !Number.isInteger(value) || value < 1 || value > 31);
    if (invalidValue != null) {
      throw new ExceptionInvalidInvariant({
        message: `Monthdays value ${invalidValue} is out of range 1..31`,
        field: 'monthdays',
      });
    }

    return new MonthdaysVo(values);
  }

  public static restore(values: number[]): MonthdaysVo {
    return new MonthdaysVo(values);
  }

  public equals(other: MonthdaysVo): boolean {
    if (this.value.length !== other.value.length) {
      return false;
    }

    return this.value.every((value, index) => value === other.value[index]);
  }

  static #normalize(values: number[]): number[] {
    return values.toSorted((left, right) => left - right);
  }
}

export { MonthdaysVo };
