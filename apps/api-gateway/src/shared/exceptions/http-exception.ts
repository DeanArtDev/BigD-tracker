import { BaseRpcException, mapRpsKindToHttpStatus } from '@big-d/api-contracts';
import { HttpException } from '@nestjs/common';

class BaseHttpException extends HttpException {
  constructor(...state: ConstructorParameters<typeof HttpException>) {
    super(...state);
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
