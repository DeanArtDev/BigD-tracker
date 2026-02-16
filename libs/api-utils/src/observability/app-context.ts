import { AsyncLocalStorage } from 'node:async_hooks';

interface AppContextState {
  readonly correlationId?: string;
  readonly subjectId?: number;
  readonly initiator?: 'user' | 'system';
}

const AppContext = new AsyncLocalStorage<AppContextState>();

export { AppContext, AppContextState };
