import { BaseRpcExceptionState } from './base-rpc-exception';
import { RmqErrorKind } from './types';

function isDefaultRpcException(error: unknown): error is { error: unknown; message: string } {
  return typeof error === 'object' && error != null && 'error' in error && 'message' in error;
}

function unwrapDefaultRpcException(error: unknown): unknown {
  if (isDefaultRpcException(error)) {
    return error.error;
  }
  return undefined;
}

function defineRpcExceptionState<
  TKey extends string,
  TCode extends string,
  TKind extends RmqErrorKind,
  TDetails extends Record<string, unknown>,
>(state: {
  key: TKey;
  code: TCode;
  kind: TKind;
  details: TDetails;
}): BaseRpcExceptionState<TKey, TCode, TKind, TDetails> {
  return {
    key: state.key,
    code: state.code,
    kind: state.kind,
    details: state.details,
  };
}

export { isDefaultRpcException, unwrapDefaultRpcException, defineRpcExceptionState };
