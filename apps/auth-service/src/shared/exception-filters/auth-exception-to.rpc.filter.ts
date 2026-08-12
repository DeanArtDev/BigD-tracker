import { ExceptionAuthInvalidInvariant } from '@/modules/auth/domain/exceptions';
import { ExceptionAuthInfrastructure } from '@/modules/auth/infrastructure/exceptions';
import { BaseRpcException, RmqErrorKind } from '@big-d/api-contracts';
import { BaseException, exceptionCode, isBaseException } from '@big-d/exceptions';
import { Catch, ExceptionFilter } from '@nestjs/common';
import { AuthServiceRequestContext } from '@shared/request-context';
import { Observable, throwError } from 'rxjs';

@Catch()
export class GoalExceptionToRpc implements ExceptionFilter {
  catch(exception: unknown): Observable<BaseRpcException> {
    const correlationId = AuthServiceRequestContext.getStore()?.correlationId ?? 'There is no correlation id!';

    if (exception instanceof ExceptionAuthInvalidInvariant) {
      return throwError(() => this.#toRpcException(exception, RmqErrorKind.DOMAIN_INVARIANT_VIOLATION, correlationId));
    }

    if (exception instanceof ExceptionAuthInfrastructure) {
      return throwError(() =>
        this.#toRpcException(
          new BaseException({
            key: exception.key,
            code: exception.code,
            details: this.#toPublicInfrastructureDetails(exception),
          }),
          RmqErrorKind.INTERNAL,
          correlationId,
        ),
      );
    }

    if (isBaseException(exception)) {
      if (
        [exceptionCode.userNotFound.code, exceptionCode.userNotExist.code, exceptionCode.sessionNotFound].some(
          (code) => code === exception.code,
        )
      ) {
        return throwError(() => this.#toRpcException(exception, RmqErrorKind.NOT_FOUND, correlationId));
      }

      if (
        [exceptionCode.sessionInvalid.code, exceptionCode.sessionExpired.code].some((code) => code === exception.code)
      ) {
        return throwError(() =>
          this.#toRpcException(exception, RmqErrorKind.DOMAIN_INVARIANT_VIOLATION, correlationId),
        );
      }

      if ([exceptionCode.userAlreadyExist.code].some((code) => code === exception.code)) {
        return throwError(() => this.#toRpcException(exception, RmqErrorKind.ALREADY_EXISTS, correlationId));
      }

      if (
        [
          exceptionCode.authDBFailed.code,
          exceptionCode.invalidRpcResponse.code,
          exceptionCode.requestDataValidation.code,
        ].some((code) => code === exception.code)
      ) {
        return throwError(() => this.#toRpcException(exception, RmqErrorKind.INTERNAL, correlationId));
      }

      if ([exceptionCode.requestDataValidation.code].some((code) => code === exception.code)) {
        return throwError(() => this.#toRpcException(exception, RmqErrorKind.INVALID_ARGUMENT, correlationId));
      }

      return throwError(() => this.#toRpcException(exception, RmqErrorKind.INTERNAL, correlationId));
    }

    return throwError(() =>
      this.#toRpcException(
        new BaseException({
          code: 'UNEXPECTED',
          key: 'UNEXPECTED',
          details: {
            name: exception instanceof Error ? exception.name : 'UnexpectedError',
            message: exception instanceof Error ? exception.message : String(exception),
          },
        }),
        RmqErrorKind.INTERNAL,
        correlationId,
      ),
    );
  }

  #toPublicInfrastructureDetails(exception: InstanceType<typeof ExceptionAuthInfrastructure>): Record<string, unknown> {
    const details: Record<string, unknown> = {
      message: 'Auth infrastructure error',
    };

    if (typeof exception.details?.operation === 'string') {
      details.operation = exception.details.operation;
    }

    return details;
  }

  #toRpcException(exception: BaseException, kind: RmqErrorKind, correlationId: string): BaseRpcException {
    const { key, code, details } = exception.toResponse();

    return new BaseRpcException({
      key,
      code,
      kind,
      details: {
        correlationId,
        ...details,
      },
    });
  }
}
