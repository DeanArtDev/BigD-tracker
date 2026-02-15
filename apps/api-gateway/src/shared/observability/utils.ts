import { AsyncLocalStorage } from 'node:async_hooks';

interface LogContext {
  readonly correlationId?: string;
}

const als = new AsyncLocalStorage<LogContext>();

function getCorrelationId(): string | undefined {
  return als.getStore()?.correlationId;
}

function getALS(): AsyncLocalStorage<LogContext> {
  return als;
}

export { getCorrelationId, getALS };
