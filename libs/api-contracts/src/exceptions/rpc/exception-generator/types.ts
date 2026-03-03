import { BaseRpcException, BaseRpcExceptionState } from '../base-rpc-exception';
import { RmqErrorKind } from '../types';

type RpcExceptionClasses<
  TDefinitionMap extends Record<string, BaseRpcExceptionState<string, string, RmqErrorKind, Record<string, unknown>>>,
> = {
  [TKey in keyof TDefinitionMap as `Exception${TKey & string}`]: new (
    details: TDefinitionMap[TKey]['details'],
  ) => BaseRpcException<
    TDefinitionMap[TKey]['key'],
    TDefinitionMap[TKey]['code'],
    TDefinitionMap[TKey]['kind'],
    TDefinitionMap[TKey]['details']
  >;
};

type DefinitionMap = {
  [key: string]: BaseRpcExceptionState<string, string, RmqErrorKind, Record<string, unknown>>;
};

export { RpcExceptionClasses, DefinitionMap };
