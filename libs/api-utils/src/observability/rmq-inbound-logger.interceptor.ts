import { isBaseRpcException } from '@big-d/api-contracts';
import { isBaseException } from '@big-d/exceptions';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { defer, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppContext } from './app-context';
import { RmqLogger } from './rmq-logger';
import { RequestContext, RequestContextState } from './request-context';

@Injectable()
export class RmqInboundLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: RmqLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rmqCtx = context.switchToRpc().getContext<RmqContext>();
    const pattern = String(rmqCtx.getPattern());

    const msg = rmqCtx.getMessage();
    const headers = (msg?.properties?.headers ?? {}) as Record<string, any>;

    const correlationId =
      headers['x-correlation-id'] ?? headers['X-Correlation-Id'] ?? msg?.properties?.correlationId;

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

    return defer(() =>
      AppContext.run(requestContext, () => {
        const started = Date.now();
        this.logger.setBindings({
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
            sort: payload?.data?.sort,
            search: payload?.data?.search,
          },
        });

        this.logger.log('rmq.consume');

        return next.handle().pipe(
          tap(() => void this.logger.log({ durationMs: Date.now() - started }, 'rmq.done')),
          catchError((err: any) => {
            this.logger.setBindings({ durationMs: Date.now() - started });

            if (isBaseRpcException(err)) {
              this.logger.error(
                {
                  err: {
                    key: err.key,
                    code: err.code,
                    kind: err.kind,
                    details: err.details,
                  },
                },
                'rmq.error',
              );
            } else if (isBaseException(err)) {
              this.logger.error(
                {
                  err: {
                    key: err.key,
                    code: err.code,
                    details: err.details,
                  },
                },
                'rmq.error',
              );
            }

            throw err;
          }),
        );
      }),
    );
  }
}
