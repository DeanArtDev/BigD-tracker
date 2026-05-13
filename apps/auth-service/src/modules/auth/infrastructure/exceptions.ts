import {
  defineExceptionState,
  exceptionCode,
  generateBaseExceptionsGuards,
  generateExceptionClasses,
} from '@big-d/exceptions';

const InfrastructureExceptionStateList = {
  AuthInfrastructure: defineExceptionState({
    key: 'AUTH_INFRASTRUCTURE_ERROR',
    code: exceptionCode.authDBFailed.code,
    details: exceptionCode.authDBFailed.details,
  }),
};

export const { ExceptionAuthInfrastructure } = generateExceptionClasses(InfrastructureExceptionStateList);

export const { isExceptionAuthInfrastructure } = generateBaseExceptionsGuards([
  ['isExceptionAuthInfrastructure', ExceptionAuthInfrastructure],
]);
