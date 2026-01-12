import {
  isBaseRpcException,
  isDefaultRpcException,
  unwrapDefaultRpcException,
} from '@big-d/api-contracts';
import { isBaseExceptionInstance } from '@big-d/exceptions';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  GatewayTimeoutException,
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

    // RPC errors
    if (isDefaultRpcException(exception)) {
      const error = unwrapDefaultRpcException(exception);

      if (isBaseRpcException(error)) {
        const httpException = BaseHttpException.createFromRpc(error);
        return response.status(httpException.getStatus()).json(httpException.getResponse());
      }
    }

    // HTTP errors
    if (isHttpException(exception)) {
      return response.status(exception.getStatus()).json(exception.getResponse());
    }
    if (isHttpExceptionPlain(exception)) {
      const httpException = shapePlainToBaseHttpException(exception);
      return response.status(httpException.getStatus()).json(httpException.getResponse());
    }

    if (isBaseExceptionInstance(exception)) {
      const httpExc = new GatewayTimeoutException(exception.toResponse());
      return response.status(httpExc.getStatus()).json(httpExc.getResponse());
    }

    this.#defaultResponse(exception, response);
  }

  #defaultResponse(error: unknown, response: Response) {
    const err = new InternalServerErrorException(String(error));
    response.status(err.getStatus()).json(err.getResponse());
  }
}
