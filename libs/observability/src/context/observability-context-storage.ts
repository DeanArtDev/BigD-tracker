import type { ObservabilityContext } from '../core';
import { AsyncLocalStorage } from 'node:async_hooks';

class ObservabilityContextNotFoundError extends Error {
  constructor() {
    super('Observability context is not available in the current asynchronous execution');
    this.name = 'ObservabilityContextNotFoundError';
  }
}

/** Stores the observability context for one asynchronous execution chain. */
class ObservabilityContextStorage {
  private readonly storage = new AsyncLocalStorage<ObservabilityContext>();

  /** Runs a callback with the supplied context and restores the parent context afterwards. */
  run<TResult>(context: ObservabilityContext, callback: () => TResult): TResult {
    return this.storage.run(context, callback);
  }

  /** Returns the current context or undefined outside a context boundary. */
  get(): ObservabilityContext | undefined {
    return this.storage.getStore();
  }

  /** Returns the current context or throws when no boundary has been established. */
  require(): ObservabilityContext {
    const context = this.get();
    if (context == null) throw new ObservabilityContextNotFoundError();

    return context;
  }
}

export { ObservabilityContextNotFoundError, ObservabilityContextStorage };
