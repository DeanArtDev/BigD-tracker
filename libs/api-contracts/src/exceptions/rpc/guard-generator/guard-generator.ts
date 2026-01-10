import { BaseRpcException, isBaseRpcException } from '../base-rpc-exception';
import { RmqErrorKind } from '../types';

type Ctor<
  TKey extends string = string,
  TCode extends string = string,
  TKind extends RmqErrorKind = RmqErrorKind,
  TDetails extends Record<string, any> = Record<string, any>,
> = new (details: any) => BaseRpcException<TKey, TCode, TKind, TDetails>;

type GuardName<T extends string> = `is${T}`;

type RpcExceptionGuardsInput = readonly [GuardName<string>, Ctor];

type RpcExceptionsGuardsMap<T extends readonly RpcExceptionGuardsInput[]> = {
  [K in T[number] as K[0]]: (error: unknown) => error is InstanceType<T[number][1]>;
};

function generateRpcExceptionsGuards<
  TInput extends RpcExceptionGuardsInput[] = RpcExceptionGuardsInput[],
>(input: TInput): RpcExceptionsGuardsMap<TInput> {
  const buffer = {} as RpcExceptionsGuardsMap<TInput>;

  for (const [name, Cls] of input) {
    buffer[name] = (error: unknown): error is InstanceType<typeof Cls> => {
      const initialClass = new Cls({} as any);
      return (
        isBaseRpcException(error) &&
        error.kind === initialClass.kind &&
        error.code === initialClass.code
      );
    };
  }

  return buffer;
}

export { generateRpcExceptionsGuards, RpcExceptionGuardsInput };
