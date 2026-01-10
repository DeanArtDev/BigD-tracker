import { BaseException } from '@big-d/exceptions';
import { BaseRpcException } from './base-rpc-exception';
import { RmqErrorKind } from './types';

class RpcExceptionFactory {
  static createInvalidArgument(exception: BaseException): BaseRpcException {
    const { code, key, details } = exception.toResponse();
    return new BaseRpcException({
      code,
      key,
      kind: RmqErrorKind.INVALID_ARGUMENT,
      details,
    });
  }

  static createDomainInvariantViolation(exception: BaseException): BaseRpcException {
    const { code, key, details } = exception.toResponse();
    return new BaseRpcException({
      code,
      key,
      kind: RmqErrorKind.DOMAIN_INVARIANT_VIOLATION,
      details,
    });
  }

  static createAlreadyExistError(exception: BaseException): BaseRpcException {
    const { code, key, details } = exception.toResponse();
    return new BaseRpcException({
      code,
      key,
      kind: RmqErrorKind.ALREADY_EXISTS,
      details,
    });
  }

  static createInternalError(exception: BaseException): BaseRpcException {
    const { code, key, details } = exception.toResponse();
    return new BaseRpcException({
      code,
      key,
      kind: RmqErrorKind.INTERNAL,
      details,
    });
  }

  static createNotFoundError(exception: BaseException): BaseRpcException {
    const { code, key, details } = exception.toResponse();
    return new BaseRpcException({
      code,
      key,
      kind: RmqErrorKind.NOT_FOUND,
      details,
    });
  }
}

export { RpcExceptionFactory };
