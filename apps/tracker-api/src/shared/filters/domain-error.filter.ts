import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { DomainValidationError } from '@shared/lib/errors';
import { Response } from 'express';

@Catch(DomainValidationError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(400).json({
      statusCode: 400,
      message: exception.message,
      error: 'Bad Request',
      field: exception.field,
      cause: exception.domain,
    });
  }
}
