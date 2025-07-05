import { isRpcDomainValidationError } from '@big-d/api-contracts';
import {
  ExceptionWrongLoginOrPassword,
  isExceptionWrongLoginOrPasswordBody,
} from '@big-d/api-exceptions';
import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class RpcToHttpExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const errorBody =
          'response' in error ? error.response : { message: 'Internal Server Error' };

        if (isExceptionWrongLoginOrPasswordBody(errorBody)) {
          return throwError(() => ExceptionWrongLoginOrPassword.restore(errorBody.details));
        }

        if (error.name === 'ConflictException') {
          return throwError(() => new ConflictException(error.response));
        }

        if (error.name === 'ForbiddenException') {
          return throwError(() => new ForbiddenException(error.response));
        }

        if (isRpcDomainValidationError(error)) {
          return throwError(() => new BadRequestException(error));
        }
        return throwError(() => error);
      }),
    );
  }
}
