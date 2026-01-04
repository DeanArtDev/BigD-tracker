import { HttpException, HttpStatus } from '@nestjs/common';
import { BaseHttpException } from '@shared/exceptions';

interface HttpExceptionPlain {
  status: HttpStatus;
  response: string | Record<string, any>;
}

function isHttpExceptionPlain(error: unknown): error is HttpExceptionPlain {
  return typeof error === 'object' && error != null && 'status' in error && 'response' in error;
}

function isHttpException(error: unknown) {
  return error instanceof HttpException || error instanceof BaseHttpException;
}

function shapePlainToBaseHttpException(error: HttpExceptionPlain): BaseHttpException {
  return new BaseHttpException(error.response, error.status);
}

export { isHttpException, shapePlainToBaseHttpException, isHttpExceptionPlain };
