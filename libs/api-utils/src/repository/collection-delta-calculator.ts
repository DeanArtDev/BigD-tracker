import { IdType } from './types';

interface CollectionDelta<TId extends IdType = number> {
  toInsert: TId[];
  toDelete: TId[];
  toKeep: TId[];
}

class CollectionDeltaCalculator {
  static calculate<TId extends IdType = number>(data: { currentIds: TId[]; previousIds: TId[] }): CollectionDelta<TId> {
    const { previousIds, currentIds } = data;

    const previousSet = new Set(previousIds);
    const currentSet = new Set(currentIds);

    const toInsert = [...currentSet].filter((id) => !previousSet.has(id));
    const toDelete = [...previousSet].filter((id) => !currentSet.has(id));
    const toKeep = [...currentSet].filter((id) => previousSet.has(id));

    return { toInsert, toDelete, toKeep };
  }
}

export { CollectionDeltaCalculator, CollectionDelta };
