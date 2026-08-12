import { RequestContext, resolveSafeTimezone } from '@big-d/api-utils';
import { CORRELATION_HEADER_KEY, USER_TIME_ZONE_HEADER_KEY } from '@big-d/observability';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { TrainingServiceRequestContext } from './app-request-context';

@Injectable()
class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const rmqContext = context.switchToRpc().getContext<RmqContext>();
    const message = rmqContext.getMessage();
    const headers = (message?.properties?.headers ?? {}) as Record<string, unknown>;

    const correlationId =
      headers[CORRELATION_HEADER_KEY] ??
      headers[CORRELATION_HEADER_KEY.toUpperCase()] ??
      message?.properties?.correlationId;
    const rawUserTimezone =
      headers[USER_TIME_ZONE_HEADER_KEY] ??
      headers[USER_TIME_ZONE_HEADER_KEY.toUpperCase()] ??
      message?.properties?.[USER_TIME_ZONE_HEADER_KEY];
    const userTimezone = typeof rawUserTimezone === 'string' ? rawUserTimezone : undefined;
    const requestContext = new RequestContext({
      correlationId: typeof correlationId === 'string' ? correlationId : undefined,
      source: 'rmq',
      userTimezone: resolveSafeTimezone(userTimezone),
    });

    return new Observable((subscriber) =>
      TrainingServiceRequestContext.run(requestContext, () => next.handle().subscribe(subscriber)),
    );
  }
}

export { RequestContextInterceptor };
