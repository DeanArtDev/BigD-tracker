import { BaseValueObject } from './base-value-object';

class Result implements BaseValueObject {
  #value: number;
  private constructor(value: number) {
    this.#value = value;
    Object.freeze(this);
  }

  get value(): number {
    return this.#value;
  }

  public static create(value: number): Result {
    if (value < 0 || value > 100) {
      throw new Error('Result available value range is from 0 to 100');
    }

    return new Result(value);
  }

  public static restore(value: number): Result {
    return new Result(value);
  }

  public equals(other: Result): boolean {
    return this.value === other.value;
  }
}

export { Result };
