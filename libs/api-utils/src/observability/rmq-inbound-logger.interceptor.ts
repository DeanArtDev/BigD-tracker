import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { defer, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CORRELATION_HEADER_KEY, USER_TIME_ZONE_HEADER_KEY } from './constants';
import { RequestContext } from './request-context';
import { RmqLogger } from './rmq-logger';

@Injectable()
export class RmqInboundLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: RmqLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rmqCtx = context.switchToRpc().getContext<RmqContext>();
    const pattern = String(rmqCtx.getPattern());

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

    const fields = msg?.fields ?? {};
    const props = msg?.properties ?? {};
    const payload = context.switchToRpc().getData();

    const requestContext = new RequestContext({
      correlationId,
      initiator: 'user',
      userId: payload?.data?.userId,
      source: 'rmq',
      userTimezone,
      subjectId: payload?.data?.taskId ?? payload?.data?.groupId ?? payload?.data?.goalId,
    });

    const getContent = () => ({
      direction: 'in',
      kind: 'handler',
      pattern,
      deliveryTag: fields.deliveryTag,
      redelivered: fields.redelivered,
      exchange: fields.exchange,
      routingKey: fields.routingKey,
      appId: props.appId,
      type: props.type,
      ...requestContext.state,
      data: payload,
    });

    return defer(() => {
      const started = Date.now();
      this.logger.log(getContent(), 'rmq.request');

      return next.handle().pipe(
        tap(() => void this.logger.log({ ...getContent(), durationMs: Date.now() - started }, 'rmq.done')),

        catchError((err: any) => {
          this.logger.error({ ...getContent(), durationMs: Date.now() - started, err }, 'rmq.error');
          return throwError(() => err);
        }),
      );
    });
  }
}
