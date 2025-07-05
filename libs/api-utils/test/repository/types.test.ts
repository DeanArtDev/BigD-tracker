import { describe, it, expectTypeOf } from 'vitest';
import type { IdType } from '../../src/repository/types';

describe('IdType', () => {
  it('is string or number', () => {
    expectTypeOf<IdType>().toEqualTypeOf<string | number>();
  });
});
