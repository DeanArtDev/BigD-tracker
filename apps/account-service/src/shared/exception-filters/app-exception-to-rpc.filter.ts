import { BaseRpcException, RpcExceptionFactory } from '@big-d/api-contracts';
import { BaseException, exceptionCode, isBaseException } from '@big-d/exceptions';
import { Catch, ExceptionFilter } from '@nestjs/common';
import { AccountRequestContext } from '@shared/request-context';
import { Observable, throwError } from 'rxjs';

@Catch()
export class AccountExceptionToRpc implements ExceptionFilter {
  catch(exception: unknown): Observable<BaseRpcException> {
    const correlationId = AccountRequestContext.getStore()?.correlationId ?? 'There is no correlation id!';

    if (isBaseException(exception)) {
      if (
        [exceptionCode.userNotFound.code, exceptionCode.sessionNotFound.code].some((code) => code === exception.code)
      ) {
        return throwError(() => RpcExceptionFactory.createNotFoundError(exception));
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
