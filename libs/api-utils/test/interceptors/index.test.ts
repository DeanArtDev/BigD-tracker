import { describe, it, expect } from 'vitest';
import * as index from '../../src/interceptors';
import { ErrorsToRpcExceptionInterceptor } from '../../src/interceptors/errors-to-rpc-exception.interceptor';

describe('interceptors index exports', () => {
  it('re-exports interceptor', () => {
    expect(index.ErrorsToRpcExceptionInterceptor).toBe(ErrorsToRpcExceptionInterceptor);
  });
});
