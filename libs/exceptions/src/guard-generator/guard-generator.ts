import { BaseException, isBaseException } from '../exceptions';

type Ctor<
  TKey extends string = string,
  TCode extends string = string,
  TDetails extends Record<string, any> = Record<string, any>,
> = new (details: any) => BaseException<TKey, TCode, TDetails>;

type GuardName<T extends string> = `is${T}`;

type BaseExceptionGuardInput = readonly [GuardName<string>, Ctor];

type BaseExceptionsGuardsMap<T extends readonly BaseExceptionGuardInput[]> = {
  [K in T[number] as K[0]]: (error: unknown) => error is InstanceType<K[1]>;
};

function generateBaseExceptionsGuards<TInput extends BaseExceptionGuardInput[] = BaseExceptionGuardInput[]>(
  input: TInput,
): BaseExceptionsGuardsMap<TInput> {
  const buffer = {} as BaseExceptionsGuardsMap<TInput>;

  for (const [name, Cls] of input) {
    buffer[name] = (error: unknown): error is InstanceType<typeof Cls> => {
      const initialClass = new Cls({} as any);
      return isBaseException(error) && error.key === initialClass.key && error.code === initialClass.code;
    };
  }

  return buffer;
}

export { generateBaseExceptionsGuards, BaseExceptionGuardInput };
