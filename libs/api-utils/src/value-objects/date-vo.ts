import { isISO8601, isBefore, isAfter } from 'validator';
import { BaseValueObject } from './base-value-object';

type DateVoState = string | Date;

class DateVo implements BaseValueObject {
  #state: string;

  private constructor(state: string) {
    this.#state = state;
  }

  get value(): string {
    return this.#state;
  }

  public static create(date: DateVoState): DateVo {
    if (date instanceof Date) {
      return new DateVo(date.toISOString());
    }

    if (isISO8601(date)) {
      return new DateVo(date);
    }

    throw new Error(`Date: ${date} must be ISO8601 format`);
  }

  public static restore(date: string): DateVo {
    return new DateVo(date);
  }

  public equals(other: DateVo): boolean {
    return this.#state === other.value;
  }

  public isBefore(data: DateVoState): boolean {
    return isBefore(this.#state, data.toString());
  }

  public isAfter(data: DateVoState): boolean {
    return isAfter(this.#state, data.toString());
  }
}

export { DateVo, DateVoState };
