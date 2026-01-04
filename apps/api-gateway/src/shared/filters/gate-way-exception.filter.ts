import {
  isBaseRpcException,
  isDefaultRpcException,
  unwrapDefaultRpcException,
} from '@big-d/api-contracts';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseHttpException } from '@shared/exceptions';
import { isHttpException, isHttpExceptionPlain, shapePlainToBaseHttpException } from './helpers';
import { Response } from 'express';

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
        response.status(httpException.getStatus()).json(httpException.getResponse());
      }
    }

    // HTTP errors
    if (isHttpException(exception)) {
      response.status(exception.getStatus()).json(exception.getResponse());
    }
    if (isHttpExceptionPlain(exception)) {
      const httpException = shapePlainToBaseHttpException(exception);
      response.status(httpException.getStatus()).json(httpException.getResponse());
    }

    this.#defaultResponse(exception, response);
  }

  #defaultResponse(error: unknown, response: Response) {
    const err = new InternalServerErrorException(String(error));
    response.status(err.getStatus()).json(err.getResponse());
  }
}
