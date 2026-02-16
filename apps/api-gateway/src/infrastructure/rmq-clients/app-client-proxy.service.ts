import { ExceptionRpcRequestTimeout } from '@/infrastructure/rmq-clients/exceptions';
import { isBaseRpcException, unwrapDefaultRpcException } from '@big-d/api-contracts';
import { CORRELATION_HEADER_KEY, AppContext, RmqLogger, RequestContext } from '@big-d/api-utils';
import { isBaseException } from '@big-d/exceptions';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError, timeout, TimeoutError } from 'rxjs';

class AppRmqClient {
  constructor(
    private readonly client: ClientProxy,
    private readonly logger: RmqLogger,
    private readonly options: {
      timeout: number;
    },
  ) {}

  public async send<TRes, TReq>(pattern: string, payload: TReq): Promise<TRes> {
    const started = Date.now();
    const cid = AppContext.getStore()?.correlationId ?? 'There is no correlation id!';
    const requestContext = new RequestContext({
      correlationId: cid,
      initiator: 'user',
      source: 'rmq',
    });

    this.logger.setBindings({
      pattern,
      direction: 'out',
      durationMs: Date.now() - started,
      ...requestContext.state,
    });

    const builtPayload = new RmqRecordBuilder<TReq>(payload)
      .setOptions({
        headers: {
          [CORRELATION_HEADER_KEY]: cid,
        },
      })
      .build();

    this.logger.log('rmq.request');

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

      this.logger.log('rmq.reply');

      return response;
    } catch (error: unknown) {
      const err = unwrapDefaultRpcException(error) ?? error;

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
        throw error;
      }

      if (isBaseException(err)) {
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
        throw error;
      }

      this.logger.error({
        message: 'Unknown error!!',
      });
      throw error;
    }
  }
}

export { AppRmqClient };
