import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const GateWayExceptionStateList = {
  WrongRpcResponse: defineExceptionState({
    key: 'INVALID_RESPONSE',
    code: exceptionCode.invalidRpcResponse.code,
    details: exceptionCode.invalidRpcResponse.details,
  }),

  RequestDataValidation: defineExceptionState({
    key: 'INVALID_REQUEST_DATA',
    code: exceptionCode.requestDataValidation.code,
    details: exceptionCode.requestDataValidation.details,
  }),

  TaskSettingsNotFound: defineExceptionState({
    key: 'TASK_SETTINGS_NOT_FOUND',
    code: exceptionCode.taskSettingsNotFound.code,
    details: exceptionCode.taskSettingsNotFound.details,
  }),
};

export const { ExceptionWrongRpcResponse, ExceptionRequestDataValidation, ExceptionTaskSettingsNotFound } =
  generateExceptionClasses(GateWayExceptionStateList);
