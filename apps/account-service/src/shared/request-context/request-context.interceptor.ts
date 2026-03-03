import { CORRELATION_HEADER_KEY, RequestContext, USER_TIME_ZONE_HEADER_KEY } from '@big-d/api-utils';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { AccountRequestContext } from './app-request-context';
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

    const userTimezone =
      headers[USER_TIME_ZONE_HEADER_KEY] ??
      headers[USER_TIME_ZONE_HEADER_KEY.toUpperCase()] ??
      msg?.properties?.[USER_TIME_ZONE_HEADER_KEY];

    return AccountRequestContext.run(
      new RequestContext({
        correlationId,
        source: 'rmq',
        userTimezone,
      }),
      () => {
        return next.handle();
      },
    );
  }
}
