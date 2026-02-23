import { isBaseRpcException, unwrapDefaultRpcException } from '@big-d/api-contracts';
import { isBaseException, exceptionCode } from '@big-d/exceptions';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  GatewayTimeoutException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
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
        const exn = new BaseHttpException(exception, HttpStatus.UNAUTHORIZED);
        return response.status(exn.getStatus()).json(exn.getResponse());
      }

      const httpExc = new GatewayTimeoutException(exception.toResponse());
      return response.status(httpExc.getStatus()).json(httpExc.getResponse());
    }

    if (isHttpException(exception)) {
      return response.status(exception.getStatus()).json(exception.getResponse());
    }

    if (isHttpExceptionPlain(exception)) {
      const httpException = shapePlainToBaseHttpException(exception);
      return response.status(httpException.getStatus()).json(httpException.getResponse());
    }

    return this.#defaultResponse(exception, response);
  }

  #defaultResponse(error: unknown, response: Response) {
    const err = new InternalServerErrorException(String(error));
    return response.status(err.getStatus()).json(err.getResponse());
  }
}
