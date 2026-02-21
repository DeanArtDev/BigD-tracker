import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const RmqClientExceptionStateList = {
  UserNotFound: defineExceptionState({
    key: 'USER_NOT_FOUND',
    code: exceptionCode.userNotFound.code,
    details: exceptionCode.userNotFound.details,
  }),

  SessionNotFound: defineExceptionState({
    key: 'SESSION_NOT_FOUND',
    code: exceptionCode.sessionNotFound.code,
    details: exceptionCode.sessionNotFound.details,
  }),

  SessionExpired: defineExceptionState({
    key: 'SESSION_NOT_FOUND',
    code: exceptionCode.sessionExpired.code,
    details: exceptionCode.sessionExpired.details,
  }),
};

export const { ExceptionUserNotFound, ExceptionSessionNotFound, ExceptionSessionExpired } =
  generateExceptionClasses(RmqClientExceptionStateList);
