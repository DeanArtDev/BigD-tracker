import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { defer, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppContext } from './app-context';
import { CORRELATION_HEADER_KEY } from './constants';
import { RequestContext, RequestContextState } from './request-context';
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

    const fields = msg?.fields ?? {};
    const props = msg?.properties ?? {};
    const payload = context.switchToRpc().getData();

    const requestContext = new RequestContext<RequestContextState>({
      correlationId,
      initiator: 'user',
      userId: payload?.data?.userId,
      source: 'rmq',
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
      data: {
        taskId: payload?.data?.taskId,
        groupId: payload?.data?.groupId,
        goalId: payload?.data?.goalId,
        from: payload?.data?.from,
        to: payload?.data?.to,
        filter: payload?.data?.filter,
        userId: payload?.data?.userId,
        cursor: payload?.data?.cursor,
        limit: payload?.data?.limit,
        sort: payload?.data?.sort,
        search: payload?.data?.search,
      },
    });

    return defer(() =>
      AppContext.run(requestContext, () => {
        const started = Date.now();
        this.logger.log(getContent(), 'rmq.request');

        return next.handle().pipe(
          tap(
            () =>
              void this.logger.log(
                { ...getContent(), durationMs: Date.now() - started },
                'rmq.done',
              ),
          ),

          catchError((err: any) => {
            this.logger.error(
              { ...getContent(), durationMs: Date.now() - started, err },
              'rmq.error',
            );
            return throwError(() => err);
          }),
        );
      }),
    );
  }
}
