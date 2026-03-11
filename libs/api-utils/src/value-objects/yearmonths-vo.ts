import { BaseValueObject } from './base-value-object';
import { ExceptionInvalidInvariant } from './exceptions';

class YearmonthsVo implements BaseValueObject {
  #state: number[];

  private constructor(state: number[]) {
    this.#state = YearmonthsVo.#normalize(state);
  }

  get value(): number[] {
    return this.#state;
  }

  public static create(values: number[]): YearmonthsVo {
    if (!Array.isArray(values)) {
      throw new ExceptionInvalidInvariant({
        message: 'Yearmonths must be an array',
        field: 'yearmonths',
      });
    }

    const invalidValue = values.find((value) => !Number.isInteger(value) || value < 1 || value > 12);
    if (invalidValue != null) {
      throw new ExceptionInvalidInvariant({
        message: `Yearmonths value ${invalidValue} is out of range 1..12`,
        field: 'yearmonths',
      });
    }

    return new YearmonthsVo(values);
  }

  public static restore(values: number[]): YearmonthsVo {
    return new YearmonthsVo(values);
  }

  public equals(other: YearmonthsVo): boolean {
    if (this.value.length !== other.value.length) {
      return false;
    }

    return this.value.every((value, index) => value === other.value[index]);
  }

  static #normalize(values: number[]): number[] {
    return values.toSorted((left, right) => left - right);
  }
}

export { YearmonthsVo };
