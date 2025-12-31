import { isBaseRpcException, isDefaultRpcError, unwrapDefaultRpcError } from '@big-d/api-contracts';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseHttpException } from '@shared/exceptions';
import { Response } from 'express';
import { Observable, throwError } from 'rxjs';

@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(nestRpcError: unknown, host: ArgumentsHost): Observable<BaseHttpException> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (!isDefaultRpcError(nestRpcError)) {
      return throwError(() => new InternalServerErrorException(JSON.stringify(error, null, 2)));
    }

    const error = unwrapDefaultRpcError(nestRpcError);
    if (isBaseRpcException(error)) {
      const httpException = BaseHttpException.createFromRpc(error);
      response.status(httpException.getStatus()).json(httpException.getResponse());
    }

    return throwError(() => new InternalServerErrorException(JSON.stringify(error, null, 2)));
  }
}
