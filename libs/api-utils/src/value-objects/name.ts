import { isEmpty } from 'validator';
import { BaseValueObject } from './base-value-object';

class Name implements BaseValueObject<Name> {
  static CHAR_LIMIT = 256;
  #value: string;
  private constructor(date: string) {
    this.#value = date;
    Object.freeze(this);
  }

  get value(): string {
    return this.#value;
  }

  public static create(value: string): Name {
    const normalized = value.trim();

    if (isEmpty(normalized)) {
      throw new Error(`Name: ${normalized} must not be empty string`);
    }

    if (normalized.length > Name.CHAR_LIMIT) {
      throw new Error(`Name: ${normalized} is to long. Limit is ${Name.CHAR_LIMIT}`);
    }

    return new Name(normalized);
  }

  public static restore(date: string): Name {
    return new Name(date);
  }

  public equals(other: Name): boolean {
    return this.value === other.value;
  }
}

export { Name };
