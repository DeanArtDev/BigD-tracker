import { CombinedGraphQLErrors, ErrorLike, ServerError, ServerParseError, UnconventionalError } from '@apollo/client';
import { isBaseException } from '@big-d/exceptions';
import { ApiError } from './api-error';

function unknownAppError(message: string, key: ApiError['key'] = 'UNKNOWN'): ApiError {
  return new ApiError({
    key,
    code: 'XX-X-0000',
    message,
    correlationId: 'n/a',
  });
}

function isAppError(error: unknown): error is ApiError {
  return isBaseException(error) && 'message' in error && 'correlationId' in error;
}

function fromApolloError(error: ErrorLike | undefined): ApiError[] {
  if (!error) return [];

  // Прикладные ошибки из errors[] ответа GraphQL
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.map((e) => {
      if (isAppError(e.extensions)) {
        const { key, code, message, correlationId, ...rest } = e.extensions;

        return new ApiError({
          key: key ?? 'INTERNAL',
          code: code ?? 'XX-X-0000',
          message: message ?? e.message,
          correlationId: correlationId ?? 'n/a',
          path: e.path,
          details: rest,
        });
      }

      return new ApiError({
        key: 'UNKNOWN',
        code: 'XX-X-0000',
        message: 'Unknown error',
        correlationId: 'n/a',
      });
    });
  }

  //  HTTP ≠ 2xx с телом
  if (ServerError.is(error)) {
    return [unknownAppError(`HTTP ${error.statusCode}: ${error.message}`)];
  }

  // Тело не парсится как JSON
  if (ServerParseError.is(error)) {
    return [unknownAppError(error.message, 'SERVER_PARSE')];
  }

  //  Что-то нестандартное завернулось Apollo
  if (UnconventionalError.is(error)) {
    return [unknownAppError(error.message)];
  }

  // Всё прочее
  return [unknownAppError(error.message || 'Network error')];
}

export { fromApolloError, isAppError };
