import { isBaseRpcException, unwrapDefaultRpcException } from '@big-d/api-contracts';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { TEST_TRANSACTION_ID } from './create-testing-module';
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

function firstArg<T extends (...args: any[]) => any>(fn: jest.MockedFunction<T>) {
  return fn.mock.calls[0]?.[0] as Parameters<T>[0];
}

function nthArgs<T extends (...args: any[]) => any>(n: number, fn: jest.MockedFunction<T>) {
  return fn.mock.calls[0]?.[n] as Parameters<T>[0] | undefined;
}

const TEST_DATE = '2023-01-01T00:00:00.000Z';

function mockDate(dataToUse: ReturnType<Date['toISOString']> = TEST_DATE): void {
  const _global: any = global;
  const DATE_TO_USE = dataToUse;
  const _Date = _global.Date;

  (_global.Date as unknown) = jest.fn((t: Date | string = DATE_TO_USE) => new _Date(t));
  _global.Date.UTC = _Date.UTC;
  _global.Date.parse = _Date.parse;
  _global.Date.now = jest.fn(() => new _Date(DATE_TO_USE).getTime());
  _global.Date.constructor = _Date.constructor;
  _global.Date.prototype = _Date.prototype;

  afterAll(() => {
    _global.Date = _Date;
  });
}

export { mockDate, buildPayload, sendMessageBuilder, unwrapRpcError, expectTransaction, firstArg, nthArgs };
