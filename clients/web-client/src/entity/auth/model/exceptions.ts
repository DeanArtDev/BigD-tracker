import {
  defineExceptionState,
  exceptionCode,
  generateExceptionClasses,
  generateBaseExceptionsGuards,
} from '@big-d/exceptions';

const AuthList = {
  WrongLoginOrPassword: defineExceptionState({
    key: 'USER_WRONG_LOGIN_OR_PASSWORD',
    code: exceptionCode.userWrongLoginOrPassword.code,
    details: exceptionCode.userWrongLoginOrPassword.details,
  }),
};

export const { ExceptionWrongLoginOrPassword } = generateExceptionClasses({
  ...AuthList,
});

export const { isExceptionWrongLoginOrPassword } = generateBaseExceptionsGuards([
  [`isExceptionWrongLoginOrPassword`, ExceptionWrongLoginOrPassword],
]);
