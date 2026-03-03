import { RpcException } from '@nestjs/microservices';
import { RmqErrorKind } from './types';

interface BaseRpcExceptionState<
  TKey extends string,
  TCode extends string,
  TKind extends RmqErrorKind,
  TDetails extends Record<string, unknown>,
> {
  readonly key: TKey;
  readonly code: TCode;
  readonly kind: TKind;
  readonly details: TDetails;
}

/**
 * do not override toString method
 * */
class BaseRpcException<
  TKey extends string = string,
  TCode extends string = string,
  TKind extends RmqErrorKind = RmqErrorKind,
  TDetails extends Record<string, unknown> = Record<string, unknown>,
> extends RpcException {
  public constructor(state: BaseRpcExceptionState<TKey, TCode, TKind, TDetails>) {
    super(state);
  }

  get key(): TKey {
    return this.getError()['key'] as TKey;
  }

  get code(): TCode {
    return this.getError()['code'] as TCode;
  }

  get kind(): TKind {
    return this.getError()['kind'] as TKind;
  }

  get details(): TDetails {
    return this.getError()['details'] as TDetails;
  }

  public toResponse(): BaseRpcExceptionState<TKey, TCode, TKind, TDetails> {
    const { key, code, kind, details } = this.getError() as BaseRpcExceptionState<TKey, TCode, TKind, TDetails>;

    return {
      key,
      kind,
      code,
      details,
    };
  }
}

function isBaseRpcException(error: unknown): error is BaseRpcException {
  return typeof error === 'object' && error != null && 'key' in error && 'code' in error && 'kind' in error;
}

export { BaseRpcException, isBaseRpcException, BaseRpcExceptionState };
