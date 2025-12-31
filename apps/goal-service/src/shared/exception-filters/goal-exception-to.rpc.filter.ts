import { ExceptionDomainInvalidInvariant } from '@/modules/tasks/domain/errors';
import { getCorrelationId } from '@/modules/tasks/presentation/rpc/helpers';
import { BaseRpcException, RmqErrorKind } from '@big-d/api-contracts';
import { isBaseException } from '@big-d/exceptions';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class GoalExceptionToRpc implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): Observable<BaseRpcException> {
    const message = host.switchToRpc().getContext<RmqContext>().getMessage();
    const correlationId = getCorrelationId(message);

    if (error instanceof ExceptionDomainInvalidInvariant) {
      const { code, key, details } = error.toResponse();

      return throwError(
        () =>
          new BaseRpcException({
            code,
            key,
            kind: RmqErrorKind.INVALID_ARGUMENT,
            details: { ...details, correlationId },
          }),
      );
    }

    if (isBaseException(error)) {
      const { code, key, details } = error.toResponse();

      return throwError(
        () =>
          new BaseRpcException({
            code,
            key,
            kind: RmqErrorKind.INTERNAL,
            details: { ...details, correlationId },
          }),
      );
    }

    return throwError(
      () =>
        new BaseRpcException({
          code: 'UNEXPECTED',
          kind: RmqErrorKind.INTERNAL,
          key: 'UNEXPECTED',
          details: {
            correlationId,
            name: error instanceof Error ? error.name : 'UnknownError',
            message: error instanceof Error ? error.message : String(error),
          },
        }),
    );
  }
}
