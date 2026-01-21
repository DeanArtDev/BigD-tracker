import {
  defineExceptionState,
  exceptionCode,
  generateBaseExceptionsGuards,
  generateExceptionClasses,
} from '@big-d/exceptions';

const DomainExceptionStateList = {
  TaskDomainInvalidInvariant: defineExceptionState({
    key: 'INVARIANT_FAILED',
    code: exceptionCode.taskInvariantFailed.code,
    details: exceptionCode.taskInvariantFailed.details,
  }),
};

const { ExceptionTaskDomainInvalidInvariant } = generateExceptionClasses(DomainExceptionStateList);

export const { isExceptionTaskDomainInvalidInvariant } = generateBaseExceptionsGuards([
  [`isExceptionTaskDomainInvalidInvariant`, ExceptionTaskDomainInvalidInvariant],
]);

export { ExceptionTaskDomainInvalidInvariant };
