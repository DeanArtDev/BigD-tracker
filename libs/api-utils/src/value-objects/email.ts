import { isEmail } from 'validator';
import { BaseValueObject } from './base-value-object';
import { ExceptionInvalidInvariant } from './exceptions';

class Email implements BaseValueObject {
  #value: string;
  private constructor(email: string) {
    this.#value = email;
    Object.freeze(this);
  }

  get value(): string {
    return this.#value;
  }

  public static create(email: string): Email {
    if (!email) {
      throw new ExceptionInvalidInvariant({
        message: 'Email is required',
        field: 'email',
      });
    }
    const normalized = email.trim().toLowerCase();
    if (!isEmail(normalized)) {
      throw new ExceptionInvalidInvariant({
        message: `Invalid email format: "${email}"`,
        field: 'email',
      });
    }
    return new Email(normalized);
  }

  public static restore(email: string): Email {
    return new Email(email);
  }

  public getDomain(): string {
    return this.value.split('@')[1];
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }
}

export { Email };
