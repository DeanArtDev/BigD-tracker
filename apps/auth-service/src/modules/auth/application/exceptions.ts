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

  UserNotExist: defineExceptionState({
    key: 'USER_NOT_EXIST',
    code: exceptionCode.userNotExist.code,
    details: exceptionCode.userNotExist.details,
  }),
};

const AuthList = {
  WrongLoginOrPassword: defineExceptionState({
    key: 'USER_WRONG_LOGIN_OR_PASSWORD',
    code: exceptionCode.userWrongLoginOrPassword.code,
    details: exceptionCode.userWrongLoginOrPassword.details,
  }),
};

export const { ExceptionUserNotFound, ExceptionUserAlreadyExist, ExceptionWrongLoginOrPassword } =
  generateExceptionClasses({
    ...UserList,
    ...AuthList,
  });
