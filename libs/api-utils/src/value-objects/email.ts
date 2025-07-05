import { isEmail } from 'validator';

class Email {
  #value: string;
  private constructor(email: string) {
    this.#value = email;
  }

  get value(): string {
    return this.#value;
  }

  public static create(email: string): Email {
    if (!email) {
      throw new Error('Email is required');
    }
    const normalized = email.trim().toLowerCase();
    if (!isEmail(normalized)) {
      throw new Error(`Invalid email format: "${email}"`);
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

  public toString(): string {
    return this.value;
  }
}

export { Email };
