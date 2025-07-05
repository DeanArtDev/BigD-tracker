import { describe, it, expect } from 'vitest';
import { CollectionDeltaCalculator } from '../../src/repository/collection-delta-calculator';

describe('CollectionDeltaCalculator', () => {
  it('calculates delta correctly', () => {
    const delta = CollectionDeltaCalculator.calculate({
      previousIds: [1, 2, 3],
      currentIds: [2, 3, 4],
    });

    expect(delta).toEqual({
      toInsert: [4],
      toDelete: [1],
      toKeep: [2, 3],
    });
  });

  it('handles empty arrays', () => {
    const delta = CollectionDeltaCalculator.calculate({ previousIds: [], currentIds: [] });
    expect(delta).toEqual({ toInsert: [], toDelete: [], toKeep: [] });
  });
});
