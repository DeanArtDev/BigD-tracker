import {
  defineExceptionState,
  exceptionCode,
  generateBaseExceptionsGuards,
  generateExceptionClasses,
} from '@big-d/exceptions';

const DomainExceptionStateList = {
  AuthInvalidInvariant: defineExceptionState({
    key: 'INVARIANT_FAILED',
    code: exceptionCode.authInvariantFailed.code,
    details: exceptionCode.authInvariantFailed.details,
  }),
};

const { ExceptionAuthInvalidInvariant } = generateExceptionClasses(DomainExceptionStateList);

export const { isAuthInvalidInvariant } = generateBaseExceptionsGuards([
  [`isAuthInvalidInvariant`, ExceptionAuthInvalidInvariant],
]);

export { ExceptionAuthInvalidInvariant };
