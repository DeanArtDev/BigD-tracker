import { defineExceptionState, exceptionCode, generateExceptionClasses } from '@big-d/exceptions';

const DomainExceptionStateList = {
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
};

export const { ExceptionGroupNotExist, ExceptionInboxAlreadyExist, ExceptionInboxNotExist } =
  generateExceptionClasses(DomainExceptionStateList);
