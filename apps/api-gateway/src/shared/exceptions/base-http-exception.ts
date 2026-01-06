import { BaseRpcException, mapRpsKindToHttpStatus } from '@big-d/api-contracts';
import { BaseException } from '@big-d/exceptions';
import { HttpException, HttpStatus } from '@nestjs/common';

class BaseHttpException extends HttpException {
  constructor(...state: ConstructorParameters<typeof HttpException>) {
    super(...state);
  }

  static createFromBase(error: BaseException, statusCode: HttpStatus): BaseHttpException {
    return new BaseHttpException(
      {
        key: error.key,
        code: error.code,
        details: error.details,
      },
      statusCode,
    );
  }

  static createFromRpc(error: BaseRpcException): BaseHttpException {
    return new BaseHttpException(
      {
        key: error.key,
        code: error.code,
        details: error.details,
      },
      mapRpsKindToHttpStatus(error.kind),
    );
  }
}

export { BaseHttpException };
