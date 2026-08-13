import type { BaseExceptionState } from './exceptions';

const Details = {
  Empty: {} as Record<string, never>,
  Any: {} as Record<string, any>,

  Define: <TType extends Record<string, any>>(): TType => ({}) as TType,
};

function defineExceptionState<
  TKey extends string,
  TCode extends string,
  TDetails extends Record<string, any> = Record<string, any>,
>(state: { key: TKey; code: TCode; details: TDetails }): BaseExceptionState<TKey, TCode, TDetails> {
  return {
    key: state.key,
    code: state.code,
    details: state.details,
  };
}

export { Details, defineExceptionState };
