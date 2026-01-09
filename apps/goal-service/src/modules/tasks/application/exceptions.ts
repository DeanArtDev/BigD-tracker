import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const ApplicationExceptionStateList = {
  GroupNotExist: defineExceptionState({
    key: 'GROUP_NOT_EXIST',
    code: exceptionCode.groupNotExist.code,
    details: exceptionCode.groupNotExist.details,
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
};

export const {
  ExceptionTaskAlreadyInGroup,
  ExceptionTaskNotInGroup,
  ExceptionTaskNotExist,
  ExceptionGroupNotExist,
  ExceptionInboxAlreadyExist,
  ExceptionInboxNotExist,
} = generateExceptionClasses(ApplicationExceptionStateList);
