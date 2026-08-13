import { BaseException } from '../exceptions';
import type { BaseExceptionState } from '../exceptions';
import type { ExceptionClasses } from './types';

function createException<TDefinition extends BaseExceptionState<string, string>>(
  name: string,
  definition: TDefinition,
) {
  const cls = class extends BaseException<TDefinition['key'], TDefinition['code'], TDefinition['details']> {
    public constructor(details: TDefinition['details']) {
      super({ key: definition.key, code: definition.code, details });
    }
  };

  Object.defineProperty(cls, 'name', {
    value: name,
  });

  return cls;
}

function generateExceptionClasses<
  TDefinitionMap extends {
    [key: string]: BaseExceptionState<string, string>;
  },
>(definitionMap: TDefinitionMap): ExceptionClasses<TDefinitionMap> {
  const keys: (keyof TDefinitionMap & string)[] = Object.keys(definitionMap);
  const classes = keys.reduce((acc, key) => {
    return {
      ...acc,
      [`Exception${key}`]: createException(key, definitionMap[key]),
    };
  }, {} as ExceptionClasses<TDefinitionMap>);

  return classes;
}

export { generateExceptionClasses };
