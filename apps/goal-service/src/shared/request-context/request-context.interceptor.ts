import {
  CORRELATION_HEADER_KEY,
  RequestContext,
  resolveSafeTimezone,
  USER_TIME_ZONE_HEADER_KEY,
} from '@big-d/api-utils';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { GoalServiceRequestContext } from './app-request-context';
import { Observable } from 'rxjs';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rmqCtx = context.switchToRpc().getContext<RmqContext>();

    const msg = rmqCtx.getMessage();
    const headers = (msg?.properties?.headers ?? {}) as Record<string, any>;

    const correlationId =
      headers[CORRELATION_HEADER_KEY] ??
      headers[CORRELATION_HEADER_KEY.toUpperCase()] ??
      msg?.properties?.correlationId;

    const rawUserTimezone =
      headers[USER_TIME_ZONE_HEADER_KEY] ??
      headers[USER_TIME_ZONE_HEADER_KEY.toUpperCase()] ??
      msg?.properties?.[USER_TIME_ZONE_HEADER_KEY];

    const userTimezone = typeof rawUserTimezone === 'string' ? rawUserTimezone : undefined;
    const utz = resolveSafeTimezone(userTimezone);
    const requestContext = new RequestContext({
      correlationId,
      source: 'rmq',
      userTimezone: utz,
    });

    return new Observable((subscriber) =>
      GoalServiceRequestContext.run(requestContext, () => next.handle().subscribe(subscriber)),
    );
  }
}
