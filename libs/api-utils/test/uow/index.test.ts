import { describe, it, expect } from 'vitest';
import * as index from '../../src/uow';
import { KyselyUnitOfWork } from '../../src/uow/kysely-unit-of-work';

describe('uow index exports', () => {
  it('re-exports KyselyUnitOfWork', () => {
    expect(index.KyselyUnitOfWork).toBe(KyselyUnitOfWork);
  });
});
