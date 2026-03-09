import { BaseRpcException, mapRpsKindToHttpStatus } from '@big-d/api-contracts';
import { BaseException } from '@big-d/exceptions';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiGatewayRequestContext } from '@shared/request-context';

class BaseHttpException extends HttpException {
  constructor(response: ConstructorParameters<typeof HttpException>[0], status: number) {
    super(BaseHttpException.#attachCorrelationId(response), status);
  }

  static createFromBase(error: BaseException, statusCode: HttpStatus): BaseHttpException {
    const response = typeof error.toResponse === 'function' ? error.toResponse() : error;
    return new BaseHttpException(response, statusCode);
  }

  static createFromRpc(error: BaseRpcException): BaseHttpException {
    const response =
      typeof error.toResponse === 'function'
        ? error.toResponse()
        : {
            key: error.key,
            code: error.code,
            details: error.details,
          };

    return new BaseHttpException(response, mapRpsKindToHttpStatus(error.kind));
  }

  static #attachCorrelationId(response: ConstructorParameters<typeof HttpException>[0]) {
    const correlationId = ApiGatewayRequestContext.getStore()?.correlationId;

    if (!correlationId) {
      return response;
    }

    if (typeof response === 'string') {
      return {
        message: response,
        details: {
          correlationId,
        },
      };
    }

    if (typeof response === 'object' && response != null) {
      const payload = response as Record<string, unknown>;
      const details =
        typeof payload.details === 'object' && payload.details != null
          ? (payload.details as Record<string, unknown>)
          : undefined;

      return {
        ...payload,
        details: {
          correlationId,
          ...details,
        },
      };
    }

    return {
      message: String(response),
      details: {
        correlationId,
      },
    };
  }
}

export { BaseHttpException };
