import { RpcExceptionMap } from './lib/rpc-exception-map';
import { RpcDomainValidationError } from './rpc-exceptions';

const isRpcException = (error: unknown): error is { code: number; key: string } => {
  return (
    error != null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof error.code === 'number' &&
    'key' in error &&
    typeof error.key === 'string'
  );
};

const isRpcDomainValidationError = (error: unknown): error is RpcDomainValidationError => {
  return (
    isRpcException(error) &&
    RpcExceptionMap.DomainValidationError.code === error.code &&
    RpcExceptionMap.DomainValidationError.key === error.key
  );
};

export { isRpcDomainValidationError };
