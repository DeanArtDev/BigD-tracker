import type { ErrorLog } from '../../../contracts';

function serializePrimitiveError(error: unknown): ErrorLog {
  if (error == null) {
    return {
      type: 'UnknownError',
      message: 'Unknown error',
    };
  }

  if (typeof error === 'string') {
    return {
      type: 'Error',
      message: error,
    };
  }

  return {
    type: getPrimitiveType(error),
    message: getPrimitiveMessage(error),
  };
}

function getPrimitiveType(value: unknown): string {
  switch (typeof value) {
    case 'symbol':
      return 'Symbol';
    case 'bigint':
      return 'BigInt';
    case 'function':
      return value.name || 'Function';
    case 'boolean':
      return 'Boolean';
    case 'number':
      return 'Number';
    case 'undefined':
      return 'UnknownError';
    default:
      return 'Error';
  }
}

function getPrimitiveMessage(value: unknown): string {
  switch (typeof value) {
    case 'number':
    case 'bigint':
    case 'boolean':
      return value.toString();
    case 'symbol':
      return value.description == null ? 'Symbol()' : `Symbol(${value.description})`;
    case 'function':
      return `[Function ${value.name || 'anonymous'}]`;
    default:
      return 'Unknown error';
  }
}

export { getPrimitiveMessage, serializePrimitiveError };
