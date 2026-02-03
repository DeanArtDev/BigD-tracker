import { describe, expect, it } from 'vitest';
import { Name } from '../name';

describe('Name', () => {
  it('normalizes input with trimming', () => {
    const name = Name.create('  Jane Doe  ');

    expect(name.value).toBe('Jane Doe');
  });

  it('throws for empty string', () => {
    expect(() => Name.create('   ')).toThrowError('must not be empty string');
  });

  it('throws when longer than limit', () => {
    const longName = 'a'.repeat(Name.CHAR_LIMIT + 1);

    expect(() => Name.create(longName)).toThrowError('Limit is');
  });

  it('compares equality', () => {
    const first = Name.create('Jane Doe');
    const second = Name.create('Jane Doe');
    const third = Name.create('John Doe');

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });
});
