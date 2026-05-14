import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const UserList = {
  UserNotFound: defineExceptionState({
    key: 'USER_NOT_FOUNT',
    code: exceptionCode.userNotFound.code,
    details: exceptionCode.userNotFound.details,
  }),

  UserAlreadyExist: defineExceptionState({
    key: 'USER_ALREADY_EXIST',
    code: exceptionCode.userAlreadyExist.code,
    details: exceptionCode.userAlreadyExist.details,
  }),
};

const AuthList = {
  WrongLoginOrPassword: defineExceptionState({
    key: 'USER_WRONG_LOGIN_OR_PASSWORD',
    code: exceptionCode.userWrongLoginOrPassword.code,
    details: exceptionCode.userWrongLoginOrPassword.details,
  }),

  InvalidSession: defineExceptionState({
    key: 'INVALID_SESSION',
    code: exceptionCode.sessionInvalid.code,
    details: exceptionCode.sessionInvalid.details,
  }),

  SessionNotFound: defineExceptionState({
    key: 'SESSION_NOT_FOUND',
    code: exceptionCode.sessionNotFound.code,
    details: exceptionCode.sessionNotFound.details,
  }),
};

export const {
  ExceptionUserNotFound,
  ExceptionUserAlreadyExist,
  ExceptionWrongLoginOrPassword,
  ExceptionInvalidSession,
  ExceptionSessionNotFound,
} = generateExceptionClasses({
  ...UserList,
  ...AuthList,
});
