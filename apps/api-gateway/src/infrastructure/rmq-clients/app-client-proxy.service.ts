import { ExceptionRpcRequestTimeout } from '@/infrastructure/rmq-clients/exceptions';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { CORRELATION_HEADER_KEY, getCorrelationId, RmqLogger } from '@shared/observability';
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
    const cid = getCorrelationId() ?? 'There is no correlation id';
    this.logger.setBindings({
      pattern,
      correlationId: cid,
    });

    const started = Date.now();

    const builtPayload = new RmqRecordBuilder<TReq>(payload)
      .setOptions({
        headers: {
          [CORRELATION_HEADER_KEY]: cid,
        },
      })
      .build();

    this.logger.log('REQUEST');

    try {
      const response = await firstValueFrom(
        this.client.send<TRes, TReq>(pattern, builtPayload as TReq).pipe(
          timeout(this.options.timeout),
          catchError((err) =>
            throwError(() => {
              if (err instanceof TimeoutError) {
                new ExceptionRpcRequestTimeout({
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
          durationMs: Date.now() - started,
        },
        'REPLY',
      );

      return response;
    } catch (error: unknown) {
      this.logger.log(
        {
          durationMs: Date.now() - started,
          err: error,
        },
        'ERROR',
      );
      throw error;
    }
  }
}

export { AppRmqClient };
