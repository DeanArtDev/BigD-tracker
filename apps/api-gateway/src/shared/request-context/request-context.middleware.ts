import {
  CORRELATION_HEADER_KEY,
  RequestContext,
  resolveSafeTimezone,
  USER_TIME_ZONE_HEADER_KEY,
} from '@big-d/api-utils';
import { ApiGatewayRequestContext } from './app-request-context';
import { NextFunction, Request, Response } from 'express';

export function RequestContextMiddleware(req: Request, _: Response, next: NextFunction) {
  const correlationId = req.header(CORRELATION_HEADER_KEY) || req.header(CORRELATION_HEADER_KEY.toUpperCase());

  const userTimezone = req.header(USER_TIME_ZONE_HEADER_KEY) || req.header(USER_TIME_ZONE_HEADER_KEY.toUpperCase());

  const utz = resolveSafeTimezone(userTimezone);

  ApiGatewayRequestContext.run(
    new RequestContext({ correlationId, source: 'http', userTimezone: utz }),
    () => void next(),
  );
}
