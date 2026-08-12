import { RequestContext, resolveSafeTimezone } from '@big-d/api-utils';
import { CORRELATION_HEADER_KEY, resolveCorrelationId, USER_TIME_ZONE_HEADER_KEY } from '@big-d/observability';
import { NextFunction, Request, Response } from 'express';
import { ApiGatewayRequestContext } from './app-request-context';

export function RequestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = resolveCorrelationId(
    req.header(CORRELATION_HEADER_KEY) || req.header(CORRELATION_HEADER_KEY.toUpperCase()),
  );

  const userTimezone = req.header(USER_TIME_ZONE_HEADER_KEY) || req.header(USER_TIME_ZONE_HEADER_KEY.toUpperCase());

  const utz = resolveSafeTimezone(typeof userTimezone === 'string' ? userTimezone : undefined);

  res.setHeader(CORRELATION_HEADER_KEY, correlationId);

  ApiGatewayRequestContext.run(
    new RequestContext({ correlationId, source: 'http', userTimezone: utz }),
    () => void next(),
  );
}
