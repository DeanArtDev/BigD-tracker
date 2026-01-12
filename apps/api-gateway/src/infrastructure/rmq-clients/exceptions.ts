import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const RmqClientExceptionStateList = {
  RpcRequestTimeout: defineExceptionState({
    key: 'RPC_TIMEOUT',
    code: exceptionCode.requestTimeout.code,
    details: exceptionCode.requestTimeout.details,
  }),

  RpcServiceUnavailable: defineExceptionState({
    key: 'RPC_SERVICE_UNAVAILABLE',
    code: exceptionCode.serviceUnavailable.code,
    details: exceptionCode.serviceUnavailable.details,
  }),
};

export const { ExceptionRpcRequestTimeout, ExceptionRpcServiceUnavailable } =
  generateExceptionClasses(RmqClientExceptionStateList);
