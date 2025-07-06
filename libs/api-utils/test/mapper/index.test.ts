import { describe, it, expect } from 'vitest';
import * as index from '../../src/mapper';
import { BaseMapper } from '../../src/mapper/mapper';

describe('mapper index exports', () => {
  it('re-exports BaseMapper', () => {
    expect(index.BaseMapper).toBe(BaseMapper);
  });
});
