import { describe, it, expect } from 'vitest';
import * as index from '../../src/domain-validator';
import { DomainValidator } from '../../src/domain-validator/domain-validator';

describe('domain-validator index exports', () => {
  it('re-exports DomainValidator', () => {
    expect(index.DomainValidator).toBe(DomainValidator);
  });
});
