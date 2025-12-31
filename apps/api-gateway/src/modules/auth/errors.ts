import { defineExceptionState, exceptionCode } from '@big-d/exceptions';
import { HttpException, HttpStatus } from '@nestjs/common';

const ApplicationExceptionStateList = {
  Unauthorized: defineExceptionState({
    key: 'UNAUTHORIZED',
    code: exceptionCode.accountUnauthorized.code,
    details: exceptionCode.accountUnauthorized.details,
  }),
};

const { Unauthorized } = ApplicationExceptionStateList;
class HttpExceptionUnauthorized extends HttpException {
  constructor(details: typeof Unauthorized.details) {
    super({ key: Unauthorized.key, code: Unauthorized.code, details }, HttpStatus.UNAUTHORIZED);
  }
}

export { HttpExceptionUnauthorized };
