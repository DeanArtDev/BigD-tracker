import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const ExceptionStateList = {
  RequestContextPayload: defineExceptionState({
    key: 'BAD_REQUEST',
    code: exceptionCode.requestContextPayload.code,
    details: exceptionCode.requestContextPayload.details,
  }),
};

export const { ExceptionRequestContextPayload } = generateExceptionClasses(ExceptionStateList);
