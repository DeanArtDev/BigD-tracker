import { BaseRpcException, BaseRpcExceptionState } from '../base-rpc-exception';
import { RmqErrorKind } from '../types';
import { DefinitionMap, RpcExceptionClasses } from './types';

function createException<
  TDefinition extends BaseRpcExceptionState<string, string, RmqErrorKind, Record<string, unknown>>,
>(name: string, definition: TDefinition) {
  const cls = class extends BaseRpcException<
    TDefinition['key'],
    TDefinition['code'],
    TDefinition['kind'],
    TDefinition['details']
  > {
    public constructor(details: TDefinition['details']) {
      super({ key: definition.key, code: definition.code, kind: definition.kind, details });
    }
  };

  Object.defineProperty(cls, 'name', {
    value: name,
  });

  return cls;
}

function generatePrcExceptionClasses<TDefinitionMap extends DefinitionMap>(
  definitionMap: TDefinitionMap,
): RpcExceptionClasses<TDefinitionMap> {
  const keys: (keyof TDefinitionMap & string)[] = Object.keys(definitionMap);
  const classes = keys.reduce((acc, key) => {
    return {
      ...acc,
      [`Exception${key}`]: createException(key, definitionMap[key]),
    };
  }, {} as RpcExceptionClasses<TDefinitionMap>);

  return classes;
}

export { generatePrcExceptionClasses };
