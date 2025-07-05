import { BaseRpcException } from './lib/base-rpc-exception';
import { RpcExceptionMap } from './lib/rpc-exception-map';

class RpcDomainValidationError extends BaseRpcException<
  typeof RpcExceptionMap.DomainValidationError.details
> {
  constructor(details: typeof RpcExceptionMap.DomainValidationError.details) {
    super({
      key: RpcExceptionMap.DomainValidationError.key,
      code: RpcExceptionMap.DomainValidationError.code,
      status: RpcExceptionMap.DomainValidationError.status,
      details,
    });
  }
}

export { RpcDomainValidationError };
