import { describe, expect, it } from 'vitest';
import { BaseValueObject } from '../base-value-object';

class TestValueObject extends BaseValueObject {
  constructor(private readonly value: string) {
    super();
  }

  public equals(other: TestValueObject): boolean {
    return this.value === other.value;
  }
}

describe('BaseValueObject', () => {
  it('supports equality in subclasses', () => {
    const first = new TestValueObject('same');
    const second = new TestValueObject('same');
    const third = new TestValueObject('different');

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });
});
