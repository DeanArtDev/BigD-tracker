import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const AuthExceptionStateList = {
  Unauthorized: defineExceptionState({
    key: 'UNAUTHORIZED',
    code: exceptionCode.accountUnauthorized.code,
    details: exceptionCode.accountUnauthorized.details,
  }),

  AuthInvalidToken: defineExceptionState({
    key: 'AUTH_INVALID_TOKEN',
    code: exceptionCode.authInvalidTokenFormat.code,
    details: exceptionCode.authInvalidTokenFormat.details,
  }),
};

export const { ExceptionUnauthorized, ExceptionAuthInvalidToken } = generateExceptionClasses(AuthExceptionStateList);
