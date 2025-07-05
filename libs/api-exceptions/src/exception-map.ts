import { HttpStatus } from '@nestjs/common';
import { defineApiException, Details } from './lib/helpers';

export const Exception = {
  WrongLoginOrPassword: defineApiException(
    'AUTH.WRONG_LOGIN_OR_PASSWORD',
    4011,
    HttpStatus.UNAUTHORIZED,
    Details.Any,
  ),

  Unauthorized: defineApiException(
    'AUTH.UNAUTHORIZED',
    4012,
    HttpStatus.UNAUTHORIZED,
    Details.Define<{ message?: string }>(),
  ),
};
