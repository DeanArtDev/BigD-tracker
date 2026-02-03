import { describe, expect, it } from 'vitest';
import { BaseValueObject, DateVo, Email, Name, Result } from '../index';

describe('value-objects index', () => {
  it('exports value object constructors', () => {
    expect(BaseValueObject).toBeDefined();
    expect(DateVo).toBeDefined();
    expect(Email).toBeDefined();
    expect(Name).toBeDefined();
    expect(Result).toBeDefined();
  });
});
