import { isEmpty } from 'validator';
import { BaseValueObject } from './base-value-object';
import { ExceptionInvalidInvariant } from './exceptions';

class Name implements BaseValueObject {
  static CHAR_LIMIT = 256;

  #state: string;
  private constructor(date: string) {
    this.#state = date;
  }

  get value(): string {
    return this.#state;
  }

  public static create(value: string): Name {
    const normalized = value.trim();

    if (isEmpty(normalized)) {
      throw new ExceptionInvalidInvariant({
        message: `Name: ${normalized} must not be empty string`,
        field: 'name',
      });
    }

    if (normalized.length > Name.CHAR_LIMIT) {
      throw new ExceptionInvalidInvariant({
        message: `Name: ${normalized} is to long. Limit is ${Name.CHAR_LIMIT}`,
        field: 'name',
      });
    }

    return new Name(normalized);
  }

  public static restore(date: string): Name {
    return new Name(date);
  }

  public equals(other: Name): boolean {
    return this.#state === other.value;
  }
}

export { Name };
