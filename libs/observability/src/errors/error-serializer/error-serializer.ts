import type { ErrorLog } from '../../contracts';
import { normalizeMaxDepth, serializeErrorNode } from './helpers';
import type { SerializeErrorOptions } from './types';

function serializeError(error: unknown, options: SerializeErrorOptions = {}): ErrorLog {
  return serializeErrorNode(error, 0, {
    maxDepth: normalizeMaxDepth(options.maxDepth),
    errorPath: new WeakSet<object>(),
  });
}

export { serializeError };
