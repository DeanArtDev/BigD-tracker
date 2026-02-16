import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { ExceptionTaskInfrastructure } from '@/modules/tasks/infrastructure/exceptions';
import { BaseRpcException, RpcExceptionFactory } from '@big-d/api-contracts';
import { AppContext } from '@big-d/api-utils';
import { BaseException, exceptionCode, isBaseException } from '@big-d/exceptions';
import { Catch, ExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

@Catch()
export class GoalExceptionToRpc implements ExceptionFilter {
  catch(exception: unknown): Observable<BaseRpcException> {
    const correlationId = AppContext.getStore()?.correlationId ?? 'There is no correlation id!';

    if (exception instanceof ExceptionTaskDomainInvalidInvariant) {
      return throwError(() => RpcExceptionFactory.createDomainInvariantViolation(exception));
    }

    if (exception instanceof ExceptionTaskInfrastructure) {
      return throwError(() => RpcExceptionFactory.createInternalError(exception));
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
        return throwError(() => RpcExceptionFactory.createNotFoundError(exception));
      }

      if (
        [exceptionCode.taskAlreadyInGroup.code, exceptionCode.inboxAlreadyExist.code].some(
          (code) => code === exception.code,
        )
      ) {
        return throwError(() => RpcExceptionFactory.createAlreadyExistError(exception));
      }

      if (
        [
          exceptionCode.taskDBFailed.code,
          exceptionCode.taskCreationFailed.code,
          exceptionCode.invalidRpcResponse.code,
          exceptionCode.requestDateValidation.code,
        ].some((code) => code === exception.code)
      ) {
        return throwError(() => RpcExceptionFactory.createInternalError(exception));
      }

      if ([exceptionCode.requestDateValidation.code].some((code) => code === exception.code)) {
        return throwError(() => RpcExceptionFactory.createInvalidArgument(exception));
      }

      return throwError(() => RpcExceptionFactory.createInternalError(exception));
    }

    return throwError(() =>
      RpcExceptionFactory.createInternalError(
        new BaseException({
          code: 'UNEXPECTED',
          key: 'UNEXPECTED',
          details: {
            correlationId,
            name: exception instanceof Error ? exception.name : 'UnexpectedError',
            message: exception instanceof Error ? exception.message : String(exception),
          },
        }),
      ),
    );
  }
}
