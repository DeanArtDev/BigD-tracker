import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const ApplicationExceptionStateList = {
  GroupNotExist: defineExceptionState({
    key: 'GROUP_NOT_EXIST',
    code: exceptionCode.groupNotExist.code,
    details: exceptionCode.groupNotExist.details,
  }),

  GroupNotFound: defineExceptionState({
    key: 'GROUP_NOT_FOUND',
    code: exceptionCode.groupNotFound.code,
    details: exceptionCode.groupNotFound.details,
  }),

  GroupSettingsNotFound: defineExceptionState({
    key: 'GROUP_SETTINGS_NOT_FOUND',
    code: exceptionCode.groupSettingsNotFound.code,
    details: exceptionCode.groupSettingsNotFound.details,
  }),

  InboxNotExist: defineExceptionState({
    key: 'INBOX_NOT_EXIST',
    code: exceptionCode.inboxNotExist.code,
    details: exceptionCode.inboxNotExist.details,
  }),

  InboxAlreadyExist: defineExceptionState({
    key: 'INBOX_ALREADY_EXIST',
    code: exceptionCode.inboxAlreadyExist.code,
    details: exceptionCode.inboxAlreadyExist.details,
  }),

  TaskNotExist: defineExceptionState({
    key: 'TASK_NOT_EXIST',
    code: exceptionCode.taskNotExist.code,
    details: exceptionCode.taskNotExist.details,
  }),

  TaskNotFound: defineExceptionState({
    key: 'TASK_NOT_FOUNT',
    code: exceptionCode.taskNotFound.code,
    details: exceptionCode.taskNotFound.details,
  }),

  TaskNotInGroup: defineExceptionState({
    key: 'TASK_NOT_IN_GROUP',
    code: exceptionCode.taskNotInGroup.code,
    details: exceptionCode.taskNotInGroup.details,
  }),

  TaskAlreadyInGroup: defineExceptionState({
    key: 'TASK_ALREADY_IN_GROUP',
    code: exceptionCode.taskAlreadyInGroup.code,
    details: exceptionCode.taskAlreadyInGroup.details,
  }),

  TaskCreationFailed: defineExceptionState({
    key: 'TASK_CREATION_FAILED',
    code: exceptionCode.taskCreationFailed.code,
    details: exceptionCode.taskCreationFailed.details,
  }),

  TaskSettingsNotFound: defineExceptionState({
    key: 'TASK_SETTINGS_NOT_FOUND',
    code: exceptionCode.taskSettingsNotFound.code,
    details: exceptionCode.taskSettingsNotFound.details,
  }),

  TaskRecurrenceOverrideSettingsNotFound: defineExceptionState({
    key: 'TASK_RECURRENCE_OVERRIDE_SETTINGS_NOT_FOUND',
    code: exceptionCode.taskRecurrenceOverrideSettingsNotFound.code,
    details: exceptionCode.taskRecurrenceOverrideSettingsNotFound.details,
  }),

  GroupWriteConflict: defineExceptionState({
    key: 'GROUP_WRITE_CONFLICT',
    code: exceptionCode.writeConflict.code,
    details: exceptionCode.writeConflict.details,
  }),

  TaskWriteConflict: defineExceptionState({
    key: 'TASK_WRITE_CONFLICT',
    code: exceptionCode.writeConflict.code,
    details: exceptionCode.writeConflict.details,
  }),

  TaskUnprocessable: defineExceptionState({
    key: 'TASK_UNPROCESSABLE',
    code: exceptionCode.taskUnprocessable.code,
    details: exceptionCode.taskUnprocessable.details,
  }),

  RecurrenceNotExist: defineExceptionState({
    key: 'RECURRENCE_NOT_EXIST',
    code: exceptionCode.taskRecurrenceNotExist.code,
    details: exceptionCode.taskRecurrenceNotExist.details,
  }),

  OverrideNotExist: defineExceptionState({
    key: 'OVERRIDE_NOT_EXIST',
    code: exceptionCode.taskOverrideNotExist.code,
    details: exceptionCode.taskOverrideNotExist.details,
  }),
};

export const {
  ExceptionTaskCreationFailed,
  ExceptionTaskSettingsNotFound,
  ExceptionTaskRecurrenceOverrideSettingsNotFound,
  ExceptionTaskWriteConflict,
  ExceptionGroupWriteConflict,
  ExceptionGroupNotFound,
  ExceptionGroupSettingsNotFound,
  ExceptionTaskNotFound,
  ExceptionTaskAlreadyInGroup,
  ExceptionTaskNotInGroup,
  ExceptionTaskNotExist,
  ExceptionGroupNotExist,
  ExceptionInboxAlreadyExist,
  ExceptionInboxNotExist,
  ExceptionTaskUnprocessable,
  ExceptionRecurrenceNotExist,
  ExceptionOverrideNotExist,
} = generateExceptionClasses(ApplicationExceptionStateList);
