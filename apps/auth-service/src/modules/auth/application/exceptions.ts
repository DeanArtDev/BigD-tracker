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

export const { ExceptionUserNotFound, ExceptionUserAlreadyExist } = generateExceptionClasses({ ...UserList });
