import { CORRELATION_HEADER_KEY } from '@big-d/observability';
import { NextFunction, Request, Response } from 'express';
import { ApiGatewayRequestContext } from './app-request-context';
import { RequestContextMiddleware } from './request-context.middleware';

describe('RequestContextMiddleware', () => {
  it('keeps a safe incoming correlation ID and returns it in the response', () => {
    const request = {
      header: jest.fn((name: string) => (name.toLowerCase() === CORRELATION_HEADER_KEY ? 'cid-123' : undefined)),
    } as unknown as Request;
    const setHeader = jest.fn();
    const response = {
      setHeader,
    } as unknown as Response;
    const next = jest.fn(() => {
      expect(ApiGatewayRequestContext.getStore()?.correlationId).toBe('cid-123');
    }) as NextFunction;

    RequestContextMiddleware(request, response, next);

    expect(setHeader).toHaveBeenCalledWith(CORRELATION_HEADER_KEY, 'cid-123');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('replaces an unsafe correlation ID', () => {
    const request = {
      header: jest.fn((name: string) =>
        name.toLowerCase() === CORRELATION_HEADER_KEY ? 'cid-123\nforged-log' : undefined,
      ),
    } as unknown as Request;
    const response = {
      setHeader: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    RequestContextMiddleware(request, response, next);

    const correlationId = (response.setHeader as jest.Mock).mock.calls[0]?.[1] as string;
    expect(correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
