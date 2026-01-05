import {
  defineExceptionState,
  exceptionCode,
  generateBaseExceptionsGuards,
  generateExceptionClasses,
} from '@big-d/exceptions';

const DomainExceptionStateList = {
  DomainInvalidInvariant: defineExceptionState({
    key: 'INVARIANT_FAILED',
    code: exceptionCode.taskInvariantFailed.code,
    details: exceptionCode.taskInvariantFailed.details,
  }),
};

const { ExceptionDomainInvalidInvariant } = generateExceptionClasses(DomainExceptionStateList);

export const { isDomainInvalidInvariant } = generateBaseExceptionsGuards([
  [`isDomainInvalidInvariant`, ExceptionDomainInvalidInvariant],
]);

export { ExceptionDomainInvalidInvariant };
