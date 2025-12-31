import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const ApplicationExceptionStateList = {
  WrongLoginOrPassword: defineExceptionState({
    key: 'WRONG_LOGIN_OR_PASSWORD',
    code: exceptionCode.accountWrongLoginOrPassword.code,
    details: exceptionCode.accountWrongLoginOrPassword.details,
  }),
};

const { ExceptionWrongLoginOrPassword } = generateExceptionClasses(ApplicationExceptionStateList);

export { ExceptionWrongLoginOrPassword };
