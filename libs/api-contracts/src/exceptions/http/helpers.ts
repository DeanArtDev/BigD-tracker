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
    case RmqErrorKind.FAILED_PRECONDITION:
      return 409;

    case RmqErrorKind.DOMAIN_INVARIANT_VIOLATION:
      return 422;

    case RmqErrorKind.RESOURCE_EXHAUSTED:
      return 429;

    case RmqErrorKind.CANCELED:
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

export { mapRpsKindToHttpStatus };
