import { DEFAULT_MAX_ERROR_DEPTH } from '../constants';

function normalizeMaxDepth(maxDepth?: number): number {
  if (maxDepth == null) return DEFAULT_MAX_ERROR_DEPTH;
  if (!Number.isInteger(maxDepth) || maxDepth < 1) {
    throw new RangeError('maxDepth must be a positive integer');
  }

  return maxDepth;
}

export { normalizeMaxDepth };
