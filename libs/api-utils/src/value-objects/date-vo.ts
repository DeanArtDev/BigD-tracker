import { isISO8601, isDate, isBefore, isAfter, isEmpty } from 'validator';
import { BaseValueObject } from './base-value-object';

type AppDateValue = string | Date;

class DateVo implements BaseValueObject<DateVo> {
  #value: string;
  private constructor(date: string) {
    this.#value = date;
    Object.freeze(this);
  }

  get value(): string {
    return this.#value;
  }

  public static create(date: AppDateValue): DateVo {
    const normalized =
      typeof date === 'string' ? date.trim() : isDate(date.toString()) ? date.toString() : '';

    if (isEmpty(normalized) || !isISO8601(normalized)) {
      throw new Error(`Date: ${normalized} must be ISO8601 format`);
    }

    return new DateVo(normalized);
  }

  public static restore(date: string): DateVo {
    return new DateVo(date);
  }

  public equals(other: DateVo): boolean {
    return this.value === other.value;
  }

  public isBefore(data: AppDateValue) {
    return isBefore(data.toString(), this.#value);
  }

  public isAfter(data: AppDateValue) {
    return isAfter(this.#value, data.toString());
  }
}

export { DateVo };
