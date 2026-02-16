import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const RmqClientExceptionStateList = {
  RpcRequestTimeout: defineExceptionState({
    key: 'RPC_TIMEOUT',
    code: exceptionCode.requestTimeout.code,
    details: exceptionCode.requestTimeout.details,
  }),
};

export const { ExceptionRpcRequestTimeout } = generateExceptionClasses(RmqClientExceptionStateList);
