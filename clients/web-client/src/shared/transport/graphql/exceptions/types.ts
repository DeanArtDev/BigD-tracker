import { ExceptionCodes } from '@big-d/exceptions';

type ApiErrorKey =
  | 'UNAUTHORIZED' // 401
  | 'FORBIDDEN' // 403
  | 'NOT_FOUND' // 404
  | 'VALIDATION' // 400 — невалидные аргументы
  | 'UNPROCESSABLE' // 422 — нарушение доменного инварианта
  | 'CONFLICT' // 409 — состояние/уникальность
  | 'TIMEOUT' // 408 — deadline exceeded
  | 'CANCELED' // 499 — клиент закрыл запрос
  | 'RATE_LIMITED' // 429
  | 'NOT_IMPLEMENTED' // 501
  | 'UNAVAILABLE' // 503
  | 'INTERNAL' // 500 — дефолт
  | 'SERVER_PARSE'
  | 'NETWORK'
  | 'UNKNOWN';

type ApiErrorCode = ExceptionCodes;

export type { ApiErrorKey, ApiErrorCode };
