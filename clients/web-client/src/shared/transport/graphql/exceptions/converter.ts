import { CombinedGraphQLErrors, ErrorLike, ServerError, ServerParseError, UnconventionalError } from '@apollo/client';
import { exceptionCode, isBaseException } from '@big-d/exceptions';
import { ApiError } from './api-error';

function unknownAppError(message: string, key: ApiError['key'] = 'UNKNOWN'): ApiError {
  return new ApiError({
    key,
    code: exceptionCode.unknown.code,
    message,
    correlationId: 'n/a',
  });
}

function isApiPlainError(error: unknown): error is ApiError {
  return isBaseException(error) && 'correlationId' in error;
}

function fromApolloError(error: ErrorLike | undefined): ApiError[] {
  if (!error) return [];

  // Ошибка уже нормализована выше по цепочке (например, http-link при таймауте
  // выбрасывает ApiError напрямую) — пробрасываем как есть, не теряя key/code/correlationId.
  if (error instanceof ApiError) {
    return [error];
  }

  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.map((e) => {
      if (isApiPlainError(e.extensions)) {
        const { key, code, message, correlationId, ...rest } = e.extensions;

        return new ApiError({
          key: key ?? 'INTERNAL',
          code: code ?? exceptionCode.unknown.code,
          message: message ?? e.message ?? 'There is no message',
          correlationId: correlationId ?? 'n/a',
          path: e.path,
          details: rest,
        });
      }

      return new ApiError({
        key: 'UNKNOWN',
        code: exceptionCode.unknown.code,
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

export { fromApolloError };
