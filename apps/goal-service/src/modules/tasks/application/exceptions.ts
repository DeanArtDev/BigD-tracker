import {
  defineExceptionState,
  exceptionCode,
  generateBaseExceptionsGuards,
  generateExceptionClasses,
} from '@big-d/exceptions';

const DomainExceptionStateList = {
  GroupIsNotExists: defineExceptionState({
    key: 'GROUP_IS_NOT_EXISTS',
    code: exceptionCode.groupNotExists.code,
    details: exceptionCode.groupNotExists.details,
  }),
};

export const { ExceptionGroupIsNotExists } = generateExceptionClasses(DomainExceptionStateList);
export const { isExceptionGroupIsNotExists } = generateBaseExceptionsGuards([
  [`isExceptionGroupIsNotExists`, ExceptionGroupIsNotExists],
]);
