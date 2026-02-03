import { describe, expect, it } from 'vitest';
import { Email } from '../email';

describe('Email', () => {
  it('normalizes email addresses', () => {
    const email = Email.create('  User@Example.COM ');

    expect(email.value).toBe('user@example.com');
  });

  it('throws when empty', () => {
    expect(() => Email.create('')).toThrowError('Email is required');
  });

  it('throws for invalid format', () => {
    expect(() => Email.create('not-an-email')).toThrowError('Invalid email format');
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
