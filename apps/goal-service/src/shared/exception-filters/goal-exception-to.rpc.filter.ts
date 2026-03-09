import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { ExceptionTaskInfrastructure } from '@/modules/tasks/infrastructure/exceptions';
import { BaseRpcException, RmqErrorKind } from '@big-d/api-contracts';
import { BaseException, exceptionCode, isBaseException } from '@big-d/exceptions';
import { Catch, ExceptionFilter } from '@nestjs/common';
import { GoalServiceRequestContext } from '@shared/request-context';
import { Observable, throwError } from 'rxjs';

@Catch()
export class GoalExceptionToRpc implements ExceptionFilter {
  catch(exception: unknown): Observable<BaseRpcException> {
    const correlationId = GoalServiceRequestContext.getStore()?.correlationId ?? 'There is no correlation id!';

    if (exception instanceof ExceptionTaskDomainInvalidInvariant) {
      return throwError(() => this.#toRpcException(exception, RmqErrorKind.DOMAIN_INVARIANT_VIOLATION, correlationId));
    }

    if (exception instanceof ExceptionTaskInfrastructure) {
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
        [
          exceptionCode.taskNotFound.code,
          exceptionCode.taskNotExist.code,
          exceptionCode.taskNotInGroup.code,
          exceptionCode.groupNotExist.code,
          exceptionCode.groupNotFound.code,
          exceptionCode.inboxNotExist.code,
        ].some((code) => code === exception.code)
      ) {
        return throwError(() => this.#toRpcException(exception, RmqErrorKind.NOT_FOUND, correlationId));
      }

      if ([exceptionCode.taskUnprocessable.code].some((code) => code === exception.code)) {
        return throwError(() =>
          this.#toRpcException(exception, RmqErrorKind.DOMAIN_INVARIANT_VIOLATION, correlationId),
        );
      }

      if (
        [exceptionCode.taskAlreadyInGroup.code, exceptionCode.inboxAlreadyExist.code].some(
          (code) => code === exception.code,
        )
      ) {
        return throwError(() => this.#toRpcException(exception, RmqErrorKind.ALREADY_EXISTS, correlationId));
      }

      if (
        [
          exceptionCode.taskDBFailed.code,
          exceptionCode.taskCreationFailed.code,
          exceptionCode.invalidRpcResponse.code,
          exceptionCode.requestDateValidation.code,
        ].some((code) => code === exception.code)
      ) {
        return throwError(() => this.#toRpcException(exception, RmqErrorKind.INTERNAL, correlationId));
      }

      if ([exceptionCode.requestDateValidation.code].some((code) => code === exception.code)) {
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

  #toPublicInfrastructureDetails(exception: InstanceType<typeof ExceptionTaskInfrastructure>): Record<string, unknown> {
    const details: Record<string, unknown> = {
      message: 'Task infrastructure error',
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
