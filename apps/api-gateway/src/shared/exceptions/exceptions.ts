import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const GateWayExceptionStateList = {
  WrongRpcResponse: defineExceptionState({
    key: 'INVALID_RESPONSE',
    code: exceptionCode.invalidRpcResponse.code,
    details: exceptionCode.invalidRpcResponse.details,
  }),

  BadRequest: defineExceptionState({
    key: 'BAD_REQUEST',
    code: exceptionCode.badRequest.code,
    details: exceptionCode.badRequest.details,
  }),
};

export const { ExceptionWrongRpcResponse, ExceptionBadRequest } =
  generateExceptionClasses(GateWayExceptionStateList);
