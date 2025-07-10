import { describe, it, expect } from 'vitest';
import * as index from '../../src/value-objects';
import { Email } from '../../src/value-objects/email';

describe('value-objects index exports', () => {
  it('re-exports Email', () => {
    expect(index.Email).toBe(Email);
  });
});
