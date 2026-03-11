import { describe, expect, it } from 'vitest';
import { Email } from '../email';
import { ExceptionInvalidInvariant } from '../exceptions';

type InvalidInvariantError = InstanceType<typeof ExceptionInvalidInvariant>;

describe('Email', () => {
  it('normalizes email addresses', () => {
    const email = Email.create('  User@Example.COM ');

    expect(email.value).toBe('user@example.com');
  });

  it('throws when empty', () => {
    try {
      Email.create('');
      throw new Error('Expected Email.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe('Email is required');
      expect((error as InvalidInvariantError).details.field).toBe('email');
    }
  });

  it('throws for invalid format', () => {
    try {
      Email.create('not-an-email');
      throw new Error('Expected Email.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe('Invalid email format: "not-an-email"');
      expect((error as InvalidInvariantError).details.field).toBe('email');
    }
  });

  it('provides the domain portion', () => {
    const email = Email.create('user@example.com');

    expect(email.getDomain()).toBe('example.com');
  });

  it('compares equality', () => {
    const first = Email.create('user@example.com');
    const second = Email.create('USER@example.com');
    const third = Email.create('other@example.com');

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });
});
