import { RpcException } from '@nestjs/microservices';
import { RmqErrorKind } from './types';

/**
 * do not override toString method
 * */
class BaseRpcException<
  TKey extends string = string,
  TCode extends string = string,
  TKind extends RmqErrorKind = RmqErrorKind,
  TDetails extends Record<string, unknown> = Record<string, unknown>,
> extends RpcException {
  public constructor(state: {
    readonly key: TKey;
    readonly code: TCode;
    readonly kind: TKind;
    readonly details: TDetails;
  }) {
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

  public toResponse(): {
    key: TKey;
    code: TCode;
    kind: TKind;
    details: TDetails;
  } {
    const { key, code, kind, details } = this.getError() as {
      key: TKey;
      code: TCode;
      kind: TKind;
      details: TDetails;
    };

    return {
      key,
      kind,
      code,
      details,
    };
  }
}

function isBaseRpcException(error: unknown): error is BaseRpcException {
  return (
    typeof error === 'object' &&
    error != null &&
    'key' in error &&
    'code' in error &&
    'kind' in error
  );
}

export { BaseRpcException, isBaseRpcException };
