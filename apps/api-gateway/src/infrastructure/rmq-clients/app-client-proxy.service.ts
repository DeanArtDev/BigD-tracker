import { ExceptionRpcRequestTimeout } from '@/infrastructure/rmq-clients/exceptions';
import {
  CORRELATION_HEADER_KEY,
  USER_TIME_ZONE_HEADER_KEY,
  encodeActorHeaders,
  type ObservabilityLogger,
} from '@big-d/observability';
import { ObservabilityContextStorage } from '@big-d/observability/nest';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError, timeout, TimeoutError } from 'rxjs';

class AppRmqClient {
  constructor(
    private readonly client: ClientProxy,
    private readonly logger: ObservabilityLogger,
    private readonly contextStorage: ObservabilityContextStorage,
    private readonly options: {
      timeout: number;
    },
  ) {}

  public async send<TRes, TReq>(pattern: `${string}.${string}.${string}`, payload: TReq): Promise<TRes> {
    const observabilityContext = this.contextStorage.require();
    const cid = observabilityContext.trace.correlationId;
    const utz = observabilityContext.propagation.userTimezone;

    const builtPayload = new RmqRecordBuilder<TReq>(payload)
      .setOptions({
        headers: {
          [CORRELATION_HEADER_KEY]: cid,
          [USER_TIME_ZONE_HEADER_KEY]: utz,
          ...encodeActorHeaders(observabilityContext.actor),
        },
      })
      .build();

    const contextualLogger = this.logger.withContext(observabilityContext);
    const operation = contextualLogger.startOperation({
      name: pattern,
      transport: {
        type: 'rmq',
        direction: 'outbound',
        operation: pattern,
        routingKey: pattern,
      },
      request: { payload },
    });

    try {
      const response = await firstValueFrom(
        this.client.send<TRes, TReq>(pattern, builtPayload as TReq).pipe(
          timeout(this.options.timeout),
          catchError((err) =>
            throwError(() => {
              if (err instanceof TimeoutError) {
                return new ExceptionRpcRequestTimeout({
                  message: `RPC timeout (${this.options.timeout}ms)`,
                });
              }
              return err;
            }),
          ),
        ),
      );

      operation.success();
      return response;
    } catch (error) {
      operation.failure(error);
      throw error;
    }
  }
}

export { AppRmqClient };
