import { BaseRpcException } from './base-rpc-exception';
import { RmqErrorKind } from './types';

class RpcExceptionFactory {
  static createInvalidArgument<
    TKey extends string = string,
    TCode extends string = string,
    TDetails extends Record<string, unknown> = Record<string, unknown>,
  >(state: {
    key: TKey;
    code: TCode;
    details: TDetails;
  }): BaseRpcException<TKey, TCode, RmqErrorKind.UNAVAILABLE, TDetails> {
    const { code, key, details } = state;
    return new BaseRpcException<TKey, TCode, RmqErrorKind.UNAVAILABLE, TDetails>({
      code,
      key,
      kind: RmqErrorKind.UNAVAILABLE,
      details,
    });
  }

  static createInternalError<
    TKey extends string = string,
    TCode extends string = string,
    TDetails extends Record<string, unknown> = Record<string, unknown>,
  >(state: {
    key: TKey;
    code: TCode;
    details: TDetails;
  }): BaseRpcException<TKey, TCode, RmqErrorKind.INTERNAL, TDetails> {
    const { code, key, details } = state;
    return new BaseRpcException<TKey, TCode, RmqErrorKind.INTERNAL, TDetails>({
      code,
      key,
      kind: RmqErrorKind.INTERNAL,
      details,
    });
  }
}

export { RpcExceptionFactory };
