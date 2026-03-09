import { DomainValidationError } from '@big-d/api-contracts';
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { BaseHttpException } from '@shared/exceptions';
import { Response } from 'express';

/**
 * @deprecated will be deleted
 * */
@Catch(DomainValidationError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const httpException = new BaseHttpException(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        error: 'Bad Request',
        field: exception.field,
        cause: exception.domain,
      },
      HttpStatus.BAD_REQUEST,
    );

    response.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
