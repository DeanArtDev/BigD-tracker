import { HttpStatus } from '@nestjs/common';
import { defineRpcException, Details } from './helpers';

const RpcExceptionMap = {
  DomainValidationError: defineRpcException(
    'DOMAIN.ENTITY.INVALID',
    4101,
    HttpStatus.UNPROCESSABLE_ENTITY,
    Details.Define<{ domain: string; field: string; message: string }>(),
  ),
};

export { RpcExceptionMap };
