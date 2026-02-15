import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { getALS } from './utils';
import { CORRELATION_HEADER_KEY } from './constants';

export function HttpCorrelationMiddleware(req: Request, _: Response, next: NextFunction) {
  const correlationId =
    req.header(CORRELATION_HEADER_KEY) || req.header(CORRELATION_HEADER_KEY.toUpperCase());

  const als = getALS();
  als.run({ correlationId: correlationId ?? randomUUID() }, () => void next());
}
