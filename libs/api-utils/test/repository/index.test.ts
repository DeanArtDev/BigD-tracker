import { describe, it, expect } from 'vitest';
import * as index from '../../src/repository';
import { SyncCollectionRepository } from '../../src/repository/sync-collections.repository';
import { CollectionDeltaCalculator } from '../../src/repository/collection-delta-calculator';
import { BaseRepository } from '../../src/repository/base-repository';

describe('repository index exports', () => {
  it('re-exports modules', () => {
    expect(index.SyncCollectionRepository).toBe(SyncCollectionRepository);
    expect(index.CollectionDeltaCalculator).toBe(CollectionDeltaCalculator);
    expect(index.BaseRepository).toBe(BaseRepository);
  });
});
