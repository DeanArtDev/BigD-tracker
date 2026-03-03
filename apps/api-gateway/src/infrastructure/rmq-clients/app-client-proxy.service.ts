import { ExceptionRpcRequestTimeout } from '@/infrastructure/rmq-clients/exceptions';
import { isBaseRpcException, unwrapDefaultRpcException } from '@big-d/api-contracts';
import { CORRELATION_HEADER_KEY, RequestContext, RmqLogger, USER_TIME_ZONE_HEADER_KEY } from '@big-d/api-utils';
import { isBaseException } from '@big-d/exceptions';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { ApiGatewayRequestContext } from '@shared/request-context';
import { catchError, firstValueFrom, throwError, timeout, TimeoutError } from 'rxjs';

class AppRmqClient {
  constructor(
    private readonly client: ClientProxy,
    private readonly logger: RmqLogger,
    private readonly options: {
      timeout: number;
    },
  ) {}

  public async send<TRes, TReq>(pattern: `${string}.${string}.${string}`, payload: TReq): Promise<TRes> {
    const started = Date.now();
    const cid = ApiGatewayRequestContext.getStore()?.correlationId ?? 'There is no correlation id!';
    const utz = ApiGatewayRequestContext.getStore()?.state?.userTimezone ?? 'UTC';

    const requestContext = new RequestContext({
      correlationId: cid,
      initiator: 'user',
      source: 'rmq',
    });

    const builtPayload = new RmqRecordBuilder<TReq>(payload)
      .setOptions({
        headers: {
          [CORRELATION_HEADER_KEY]: cid,
          [USER_TIME_ZONE_HEADER_KEY]: utz,
        },
      })
      .build();

    this.logger.log(
      {
        pattern,
        direction: 'out',
        durationMs: Date.now() - started,
        ...requestContext.state,
      },
      'rmq.request',
    );

    try {
      const response = await firstValueFrom(
        this.client.send<TRes, TReq>(pattern, builtPayload as TReq).pipe(
          timeout(this.options.timeout),
          catchError((err) =>
            throwError(() => {
              if (err instanceof TimeoutError) {
                throw new ExceptionRpcRequestTimeout({
                  message: `RPC timeout (${this.options.timeout}ms)`,
                });
              }
              return err;
            }),
          ),
        ),
      );

      this.logger.log(
        {
          pattern,
          direction: 'out',
          durationMs: Date.now() - started,
          ...requestContext.state,
        },
        'rmq.reply',
      );

      return response;
    } catch (error: unknown) {
      const err = unwrapDefaultRpcException(error) ?? error;

      if (isBaseRpcException(err)) {
        this.logger.error(
          {
            pattern,
            direction: 'out',
            durationMs: Date.now() - started,
            ...requestContext.state,
            err: {
              key: err.key,
              code: err.code,
              kind: err.kind,
              details: err.details,
            },
          },
          'rmq.error',
        );
        throw error;
      }

      if (isBaseException(err)) {
        this.logger.error(
          {
            pattern,
            direction: 'out',
            durationMs: Date.now() - started,
            ...requestContext.state,
            err: {
              key: err.key,
              code: err.code,
              details: err.details,
            },
          },
          'rmq.error',
        );
        throw error;
      }

      this.logger.error({
        pattern,
        direction: 'out',
        durationMs: Date.now() - started,
        ...requestContext.state,
        message: 'Unknown error!!',
      });
      throw error;
    }
  }
}

export { AppRmqClient };
