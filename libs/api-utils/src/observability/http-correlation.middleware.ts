import { NextFunction, Request, Response } from 'express';
import { AppContext } from './app-context';
import { CORRELATION_HEADER_KEY } from './constants';
import { RequestContext } from './request-context';

export function HttpCorrelationMiddleware(req: Request, _: Response, next: NextFunction) {
  const correlationId =
    req.header(CORRELATION_HEADER_KEY) || req.header(CORRELATION_HEADER_KEY.toUpperCase());

  AppContext.run(new RequestContext({ correlationId, source: 'http' }), () => void next());
}
