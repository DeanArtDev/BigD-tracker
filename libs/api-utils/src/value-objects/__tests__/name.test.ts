import { describe, expect, it } from 'vitest';
import { Name } from '../name';
import { ExceptionInvalidInvariant } from '../exceptions';

type InvalidInvariantError = InstanceType<typeof ExceptionInvalidInvariant>;

describe('Name', () => {
  it('normalizes input with trimming', () => {
    const name = Name.create('  Jane Doe  ');

    expect(name.value).toBe('Jane Doe');
  });

  it('throws for empty string', () => {
    try {
      Name.create('   ');
      throw new Error('Expected Name.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe('Name:  must not be empty string');
      expect((error as InvalidInvariantError).details.field).toBe('name');
    }
  });

  it('throws when longer than limit', () => {
    const longName = 'a'.repeat(Name.CHAR_LIMIT + 1);

    try {
      Name.create(longName);
      throw new Error('Expected Name.create to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ExceptionInvalidInvariant);
      expect((error as InvalidInvariantError).details.message).toBe(
        `Name: ${longName} is to long. Limit is ${Name.CHAR_LIMIT}`,
      );
      expect((error as InvalidInvariantError).details.field).toBe('name');
    }
  });

  it('compares equality', () => {
    const first = Name.create('Jane Doe');
    const second = Name.create('Jane Doe');
    const third = Name.create('John Doe');

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });
});
