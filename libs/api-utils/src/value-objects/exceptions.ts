import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const ValueObjectExceptionStateList = {
  InvalidInvariant: defineExceptionState({
    key: 'INVARIANT_INVALID',
    code: exceptionCode.invariantFailed.code,
    details: exceptionCode.invariantFailed.details,
  }),
};

export const { ExceptionInvalidInvariant } = generateExceptionClasses(ValueObjectExceptionStateList);
