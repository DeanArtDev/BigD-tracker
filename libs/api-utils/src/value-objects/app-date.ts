import { isISO8601, isDate, isBefore, isAfter, isEmpty } from 'validator';
import { BaseValueObject } from './base-value-object';

type AppDateValue = string | Date;

class AppDate implements BaseValueObject<AppDate> {
  #value: string;
  private constructor(date: string) {
    this.#value = date;
    Object.freeze(this);
  }

  get value(): string {
    return this.#value;
  }

  public static create(date: AppDateValue): AppDate {
    const normalized =
      typeof date === 'string' ? date.trim() : isDate(date.toString()) ? date.toString() : '';

    if (isEmpty(normalized) || !isISO8601(normalized)) {
      throw new Error(`Date: ${normalized} must be ISO8601 format`);
    }

    return new AppDate(normalized);
  }

  public static restore(date: string): AppDate {
    return new AppDate(date);
  }

  public equals(other: AppDate): boolean {
    return this.value === other.value;
  }

  public isBefore(data: AppDateValue) {
    return isBefore(data.toString(), this.#value);
  }

  public isAfter(data: AppDateValue) {
    return isAfter(data.toString(), this.#value);
  }
}

export { AppDate };
