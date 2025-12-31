import { exceptionCode } from '@big-d/exceptions';

const { accountWrongLoginOrPassword, accountUnauthorized } = exceptionCode;

const isExceptionWrongLoginOrPassword = (
  error: unknown,
): error is typeof accountWrongLoginOrPassword.details => {
  return (
    typeof error === 'object' &&
    error != null &&
    'code' in error &&
    error.code === accountWrongLoginOrPassword.code
  );
};

const isExceptionUnauthorized = (error: unknown): error is typeof accountUnauthorized.details => {
  return (
    typeof error === 'object' &&
    error != null &&
    'code' in error &&
    error.code === accountUnauthorized.code
  );
};

export { isExceptionWrongLoginOrPassword, isExceptionUnauthorized };
