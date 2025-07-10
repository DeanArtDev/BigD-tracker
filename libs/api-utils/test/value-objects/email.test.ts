import { describe, it, expect } from 'vitest';
import { Email } from '../../src/value-objects/email';

describe('Email value object', () => {
  it('creates and normalizes email', () => {
    const email = Email.create(' Test@Example.com ');
    expect(email.value).toBe('test@example.com');
  });

  it('restores email without validation', () => {
    const email = Email.restore('a@b.com');
    expect(email.value).toBe('a@b.com');
  });

  it('equals compares values', () => {
    const e1 = Email.create('a@b.com');
    const e2 = Email.create('A@B.com');
    expect(e1.equals(e2)).toBe(true);
  });

  it('getDomain returns domain', () => {
    const email = Email.create('a@b.com');
    expect(email.getDomain()).toBe('b.com');
  });

  it('throws on invalid email', () => {
    expect(() => Email.create('bad')).toThrow();
  });
});
