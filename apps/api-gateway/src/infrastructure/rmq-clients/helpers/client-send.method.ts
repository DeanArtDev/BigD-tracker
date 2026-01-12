import {
  ExceptionRpcRequestTimeout,
  ExceptionRpcServiceUnavailable,
} from '@/infrastructure/rmq-clients/exceptions';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { CORRELATION_HEADER_KEY } from '@shared/interceptors/observability.interceptor';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { catchError, firstValueFrom, throwError, timeout, TimeoutError } from 'rxjs';

async function send<TResult = any, TInput = any>(
  options: { client: ClientProxy; req: Request; timeout: number },
  pattern: any,
  payload: TInput,
): Promise<TResult> {
  const { client, req } = options;

  const cid = req.headers[CORRELATION_HEADER_KEY]?.toString() ?? randomUUID();

  const builtPayload = new RmqRecordBuilder<TInput>(payload)
    .setOptions({
      headers: {
        [CORRELATION_HEADER_KEY]: cid,
      },
    })
    .build();

  return await firstValueFrom(
    client.send<TResult, TInput>(pattern, builtPayload as TInput).pipe(
      timeout(options.timeout),
      catchError((err) =>
        throwError(() => {
          if (err instanceof TimeoutError) {
            return new ExceptionRpcRequestTimeout({
              message: `account service RPC timeout (${options.timeout}ms)`,
            });
          }
          return new ExceptionRpcServiceUnavailable({ message: 'account-service unavailable' });
        }),
      ),
    ),
  );
}

export { send };
