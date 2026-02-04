import dayjs from 'dayjs';
import { isISO8601, isBefore, isAfter } from 'validator';
import { BaseValueObject } from './base-value-object';

type DateVoState = string | Date;

class DateVo implements BaseValueObject {
  #state: Date;

  private constructor(state: string) {
    if (!isISO8601(state)) {
      throw new Error(`Date: ${state} has invalid format`);
    }

    const newDate = dayjs(state);
    if (!newDate.isValid()) {
      throw new Error(`Date: ${state} is invalid`);
    }

    this.#state = newDate.set('milliseconds', 0).toDate();
  }

  get value(): string {
    return this.#state.toISOString();
  }

  public static create(date: DateVoState): DateVo {
    if (date instanceof Date) {
      return new DateVo(date.toISOString());
    }
    return new DateVo(date);
  }

  public static restore(date: string): DateVo {
    return new DateVo(date);
  }

  public equals(other: DateVo): boolean {
    return this.#state.valueOf() === dayjs(other.value).valueOf();
  }

  public isBefore(state: DateVoState): boolean {
    return isBefore(this.value, new Date(state).toISOString());
  }

  public isAfter(state: DateVoState): boolean {
    return isAfter(this.value, new Date(state).toISOString());
  }
}

export { DateVo, DateVoState };
