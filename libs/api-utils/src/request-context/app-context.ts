import { AsyncLocalStorage } from 'node:async_hooks';
import type { RequestContext } from './request-context';

const createAppContext = () => new AsyncLocalStorage<RequestContext>();

export { createAppContext };
