import { BaseException, BaseExceptionState } from '../exceptions';

type ExceptionClasses<TDefinitionMap extends Record<string, BaseExceptionState<string, string>>> = {
  [TKey in keyof TDefinitionMap as `Exception${TKey & string}`]: new (
    details: TDefinitionMap[TKey]['details'],
  ) => BaseException<TDefinitionMap[TKey]['key'], TDefinitionMap[TKey]['code'], TDefinitionMap[TKey]['details']>;
};

export { ExceptionClasses };
