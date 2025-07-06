import { describe, it, expect } from 'vitest';
import * as index from '../../src/middlewares';
import { LoggerMiddleware } from '../../src/middlewares/logger.middleware';

describe('middlewares index exports', () => {
  it('re-exports LoggerMiddleware', () => {
    expect(index.LoggerMiddleware).toBe(LoggerMiddleware);
  });
});
