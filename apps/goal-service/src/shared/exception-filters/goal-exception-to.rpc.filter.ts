import { isDomainInvalidInvariant } from '@/modules/tasks/domain/errors';
import { ExceptionTaskInfrastructure } from '@/modules/tasks/infrastructure/exceptions';
import { BaseRpcException, RpcExceptionFactory } from '@big-d/api-contracts';
import { isBaseExceptionInstance } from '@big-d/exceptions';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { getCorrelationId } from '@shared/request-context/helpers';
import { Observable, throwError } from 'rxjs';

@Catch()
export class GoalExceptionToRpc implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): Observable<BaseRpcException> {
    const message = host.switchToRpc().getContext<RmqContext>().getMessage();
    const correlationId = getCorrelationId(message);

    if (isDomainInvalidInvariant(error)) {
      return throwError(() => RpcExceptionFactory.createInvalidArgument(error.toResponse()));
    }

    if (error instanceof ExceptionTaskInfrastructure) {
      return throwError(() => RpcExceptionFactory.createInternalError(error.toResponse()));
    }

    if (isBaseExceptionInstance(error)) {
      return throwError(() => RpcExceptionFactory.createInternalError(error.toResponse()));
    }

    return throwError(() =>
      RpcExceptionFactory.createInternalError({
        code: 'UNEXPECTED',
        key: 'UNEXPECTED',
        details: {
          correlationId,
          name: error instanceof Error ? error.name : 'UnexpectedError',
          message: error instanceof Error ? error.message : String(error),
        },
      }),
    );
  }
}
