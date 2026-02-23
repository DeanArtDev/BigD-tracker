import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const AuthExceptionStateList = {
  Unauthorized: defineExceptionState({
    key: 'UNAUTHORIZED',
    code: exceptionCode.accountUnauthorized.code,
    details: exceptionCode.accountUnauthorized.details,
  }),
};

export const { ExceptionUnauthorized } = generateExceptionClasses(AuthExceptionStateList);
