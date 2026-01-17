import { isBaseRpcException, unwrapDefaultRpcException } from '@big-d/api-contracts';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { TEST_TRANSACTION_ID } from '@shared/__tests__/create-testing-module';
import { CORRELATION_HEADER_KEY } from '@shared/request-context';
import { randomUUID } from 'crypto';
import { firstValueFrom, timeout } from 'rxjs';

function buildPayload(payload: unknown) {
  return new RmqRecordBuilder(payload)
    .setOptions({
      headers: {
        [CORRELATION_HEADER_KEY]: randomUUID(),
      },
    })
    .build();
}

function sendMessageBuilder(client: ClientProxy) {
  return async <TResponse, TRequest>(pattern: string, payload: TRequest) =>
    await firstValueFrom(client.send<TResponse>(pattern, payload).pipe(timeout(2000)));
}

const unwrapRpcError = (error: unknown) => {
  const unwrapped = unwrapDefaultRpcException(error);
  if (isBaseRpcException(unwrapped)) {
    return unwrapped;
  }

  throw new Error('Exception format is wrong');
};

function expectTransaction(id = TEST_TRANSACTION_ID) {
  return expect.objectContaining({ trueTransaction: true, id });
}

export { buildPayload, sendMessageBuilder, unwrapRpcError, expectTransaction };
