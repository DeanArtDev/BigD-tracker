import { isBaseRpcException, unwrapDefaultRpcException } from '@big-d/api-contracts';
import { isBaseException, exceptionCode } from '@big-d/exceptions';
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { BaseHttpException } from '@shared/exceptions';
import { Response } from 'express';
import { isHttpException, isHttpExceptionPlain, shapePlainToBaseHttpException } from './helpers';

@Catch()
export class GateWayExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const error = unwrapDefaultRpcException(exception) ?? exception;

    // RPC exceptions
    if (isBaseRpcException(error)) {
      const httpException = BaseHttpException.createFromRpc(error);
      return response.status(httpException.getStatus()).json(httpException.getResponse());
    }

    // Domain exceptions
    if (isBaseException(exception)) {
      if (exceptionCode.accountUnauthorized.code === exception.code) {
        const exn = BaseHttpException.createFromBase(exception, HttpStatus.UNAUTHORIZED);
        return response.status(exn.getStatus()).json(exn.getResponse());
      }

      const httpExc = BaseHttpException.createFromBase(exception, HttpStatus.GATEWAY_TIMEOUT);
      return response.status(httpExc.getStatus()).json(httpExc.getResponse());
    }

    if (isHttpException(exception)) {
      if (exception instanceof BaseHttpException) {
        return response.status(exception.getStatus()).json(exception.getResponse());
      }

      const httpException = shapePlainToBaseHttpException({
        status: exception.getStatus(),
        response: exception.getResponse(),
      });

      return response.status(httpException.getStatus()).json(httpException.getResponse());
    }

    if (isHttpExceptionPlain(exception)) {
      const httpException = shapePlainToBaseHttpException(exception);
      return response.status(httpException.getStatus()).json(httpException.getResponse());
    }

    return this.#defaultResponse(exception, response);
  }

  #defaultResponse(error: unknown, response: Response) {
    const err = new BaseHttpException(
      {
        message: error instanceof Error ? error.message : String(error),
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    return response.status(err.getStatus()).json(err.getResponse());
  }
}
