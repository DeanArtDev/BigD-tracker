import { BaseException } from '@big-d/exceptions';
import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from './base-http-exception';

class HttpExceptionFactory {
  static createBadRequestException<
    TKey extends string = string,
    TCode extends string = string,
    TDetails extends Record<string, any> = Record<string, any>,
  >(exception: BaseException<TKey, TCode, TDetails>) {
    return BaseHttpException.createFromBase(exception, HttpStatus.BAD_REQUEST);
  }
}

export { HttpExceptionFactory };
