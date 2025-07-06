import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from 'events';
import { LoggerMiddleware } from '../../src/middlewares/logger.middleware';

describe('LoggerMiddleware', () => {
  it('logs request on finish', () => {
    const req = { method: 'GET', originalUrl: '/test' } as any;
    const res = new EventEmitter() as any;
    res.statusCode = 200;
    const next = vi.fn();
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});

    LoggerMiddleware(req, res, next);
    res.emit('finish');

    expect(next).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
