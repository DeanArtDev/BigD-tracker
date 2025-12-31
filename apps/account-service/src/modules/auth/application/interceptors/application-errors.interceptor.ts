import { ExceptionWrongLoginOrPassword } from '@/modules/auth/application/errors';
import { BaseRpcException, RmqErrorKind } from '@big-d/api-contracts';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class ApplicationExceptionsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof ExceptionWrongLoginOrPassword) {
          return throwError(
            () =>
              new BaseRpcException({
                code: error.code,
                key: error.key,
                kind: RmqErrorKind.UNAUTHENTICATED,
                details: error.details,
              }),
          );
        }

        return throwError(() => error);
      }),
    );
  }
}
