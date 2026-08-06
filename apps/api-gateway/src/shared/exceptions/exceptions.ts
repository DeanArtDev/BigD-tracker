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

  GroupSettingsNotFound: defineExceptionState({
    key: 'GROUP_SETTINGS_NOT_FOUND',
    code: exceptionCode.groupSettingsNotFound.code,
    details: exceptionCode.groupSettingsNotFound.details,
  }),
};

export const {
  ExceptionWrongRpcResponse,
  ExceptionRequestDataValidation,
  ExceptionTaskSettingsNotFound,
  ExceptionGroupSettingsNotFound,
} = generateExceptionClasses(GateWayExceptionStateList);
