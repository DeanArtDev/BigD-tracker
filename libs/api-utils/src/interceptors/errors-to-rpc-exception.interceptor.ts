import { DomainValidationError, RpcDomainValidationError } from '@big-d/api-contracts';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class ErrorsToRpcExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof DomainValidationError) {
          return throwError(
            () =>
              new RpcDomainValidationError({
                message: error.message,
                field: error.field,
                domain: error.domain,
              }),
          );
        }

        if (error instanceof BadRequestException) {
          const response = error.getResponse();
          const data = typeof response === 'string' ? { message: response } : response;
          return throwError(() => new RpcException({ ...data, status: error.getStatus() }));
        }

        if (error instanceof NotFoundException) {
          const response = error.getResponse();
          const data = typeof response === 'string' ? { message: response } : response;
          return throwError(() => new RpcException({ ...data, status: error.getStatus() }));
        }

        if (error instanceof InternalServerErrorException) {
          const response = error.getResponse();
          const data = typeof response === 'string' ? { message: response } : response;
          return throwError(() => new RpcException({ ...data, status: error.getStatus() }));
        }

        return throwError(() => new RpcException(error));
      }),
    );
  }
}
