import { CORRELATION_HEADER_KEY } from '@/shared/observability';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { catchError, firstValueFrom, throwError, timeout, TimeoutError } from 'rxjs';

async function send<TResult = any, TInput = any>(
  pattern: any,
  payload: TInput,
  options: {
    client: ClientProxy;
    req: Request;
    timeout: number;
    onTimeoutError: (err: TimeoutError) => Error;
  },
): Promise<TResult> {
  const { client, req, onTimeoutError } = options;

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
            throw onTimeoutError(err);
          }
          return err;
        }),
      ),
    ),
  );
}

export { send };
