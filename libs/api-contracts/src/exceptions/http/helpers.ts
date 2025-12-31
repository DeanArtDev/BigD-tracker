import { HttpStatus } from '@nestjs/common';
import { RmqErrorKind } from '../rpc';

function mapRpsKindToHttpStatus(kind: RmqErrorKind): HttpStatus | 499 {
  switch (kind) {
    case RmqErrorKind.INVALID_ARGUMENT:
    case RmqErrorKind.OUT_OF_RANGE:
      return 400;

    case RmqErrorKind.UNAUTHENTICATED:
      return 401;

    case RmqErrorKind.PERMISSION_DENIED:
      return 403;

    case RmqErrorKind.NOT_FOUND:
      return 404;

    case RmqErrorKind.ALREADY_EXISTS:
    case RmqErrorKind.CONFLICT:
    case RmqErrorKind.ABORTED:
      return 409;

    case RmqErrorKind.FAILED_PRECONDITION:
      return 412;

    case RmqErrorKind.RESOURCE_EXHAUSTED:
      return 429;

    case RmqErrorKind.CANCELLED:
      return 499;

    case RmqErrorKind.DEADLINE_EXCEEDED:
      return 408;

    case RmqErrorKind.NOT_IMPLEMENTED:
      return 501;

    case RmqErrorKind.UNAVAILABLE:
      return 503;

    case RmqErrorKind.DATA_LOSS:
    case RmqErrorKind.INTERNAL:
    default:
      return 500;
  }
}

function mapHttpStatusToRpcKind(status: number): RmqErrorKind {
  switch (status) {
    case 400:
      return RmqErrorKind.INVALID_ARGUMENT;
    case 408:
      return RmqErrorKind.DEADLINE_EXCEEDED;
    case 412:
      return RmqErrorKind.FAILED_PRECONDITION;
    case 429:
      return RmqErrorKind.RESOURCE_EXHAUSTED;

    case 401:
      return RmqErrorKind.UNAUTHENTICATED;
    case 403:
      return RmqErrorKind.PERMISSION_DENIED;

    case 404:
      return RmqErrorKind.NOT_FOUND;
    case 409:
      return RmqErrorKind.CONFLICT;

    case 501:
      return RmqErrorKind.NOT_IMPLEMENTED;
    case 503:
      return RmqErrorKind.UNAVAILABLE;

    case 499:
      return RmqErrorKind.CANCELLED;

    default:
      if (status >= 500 && status <= 599) return RmqErrorKind.INTERNAL;
      return RmqErrorKind.INVALID_ARGUMENT;
  }
}

export { mapRpsKindToHttpStatus, mapHttpStatusToRpcKind };
