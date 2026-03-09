import { isBaseRpcException } from '@big-d/api-contracts';
import { isBaseException } from '@big-d/exceptions';

type Serializable = string | number | boolean | null | undefined | Serializable[] | { [key: string]: Serializable };

interface ErrorLikeRecord extends Record<string, unknown> {
  readonly name?: string;
  readonly message?: string;
  readonly stack?: string;
  readonly cause?: unknown;
}

interface BaseExceptionLike {
  readonly key: string;
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly message?: string;
  readonly stack?: string;
}

interface BaseRpcExceptionLike extends BaseExceptionLike {
  readonly kind: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null;
}

function isErrorLikeRecord(value: unknown): value is ErrorLikeRecord {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.message === 'string' ||
    typeof value.stack === 'string' ||
    typeof value.name === 'string' ||
    'cause' in value
  );
}

function getStringField(value: unknown, field: string): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const target = value[field];
  return typeof target === 'string' ? target : undefined;
}

function getErrorType(error: unknown): string {
  if (error instanceof Error) {
    return error.name || error.constructor?.name || 'Error';
  }

  if (isErrorLikeRecord(error)) {
    return error.name ?? 'Error';
  }

  return 'Error';
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.message;
  }

  return getStringField(error, 'message');
}

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }

  return getStringField(error, 'stack');
}

function getErrorCause(error: unknown): unknown {
  if (!isRecord(error) || !('cause' in error)) {
    return undefined;
  }

  return error.cause;
}

function serializeUnknown(value: unknown, seen: WeakSet<object>): Serializable {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'symbol') {
    return value.description ? `Symbol(${value.description})` : 'Symbol()';
  }

  if (typeof value === 'function') {
    return `[Function ${value.name || 'anonymous'}]`;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof RegExp) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeUnknown(item, seen));
  }

  if (!isRecord(value)) {
    return Object.prototype.toString.call(value);
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  if (isBaseRpcException(value)) {
    return serializeBaseRpcExceptionForLog(value);
  }

  if (isBaseException(value)) {
    return serializeBaseExceptionForLog(value);
  }

  if (value instanceof Error || isErrorLikeRecord(value)) {
    return serializeErrorLike(value, seen);
  }

  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeUnknown(item, seen)]));
}

function serializeErrorLike(error: ErrorLikeRecord | Error, seen: WeakSet<object>): Serializable {
  const message = getErrorMessage(error) ?? 'Unknown error';
  const stack = getErrorStack(error);
  const cause = getErrorCause(error);

  const payload: Record<string, Serializable> = {
    type: getErrorType(error),
    message,
  };

  if (stack) {
    payload.stack = stack;
  }

  if (cause !== undefined) {
    payload.cause = serializeUnknown(cause, seen);
  }

  Object.entries(error).forEach(([key, value]) => {
    if (key === 'name' || key === 'message' || key === 'stack' || key === 'cause') {
      return;
    }

    payload[key] = serializeUnknown(value, seen);
  });

  return payload;
}

function getWrappedError(details: Record<string, unknown>): unknown {
  return details.error ?? details.cause ?? details.originalError;
}

function getBaseExceptionMessage(exception: BaseExceptionLike): string {
  return exception.message ?? `${exception.key}(${exception.code})`;
}

function serializeBaseExceptionForLog(exception: BaseExceptionLike): Record<string, Serializable> {
  const details = isRecord(exception.details) ? exception.details : {};
  const wrappedError = getWrappedError(details);
  const serializedDetails = serializeUnknown(details, new WeakSet<object>());
  const serializedWrappedError =
    wrappedError === undefined ? undefined : serializeUnknown(wrappedError, new WeakSet<object>());

  const message =
    (isRecord(serializedWrappedError) && typeof serializedWrappedError.message === 'string'
      ? serializedWrappedError.message
      : undefined) ?? getBaseExceptionMessage(exception);

  const stack =
    (isRecord(serializedWrappedError) && typeof serializedWrappedError.stack === 'string'
      ? serializedWrappedError.stack
      : undefined) ?? exception.stack;

  const payload: Record<string, Serializable> = {
    type: 'BaseException',
    message,
    key: exception.key,
    code: exception.code,
    details: serializedDetails,
  };

  if (stack) {
    payload.stack = stack;
  }

  if (serializedWrappedError !== undefined) {
    payload.cause = serializedWrappedError;
  }

  const wrapperMessage = getBaseExceptionMessage(exception);
  if (wrapperMessage !== message) {
    payload.wrapperMessage = wrapperMessage;
  }

  return payload;
}

function serializeBaseRpcExceptionForLog(exception: BaseRpcExceptionLike): Record<string, Serializable> {
  const details = isRecord(exception.details) ? exception.details : {};

  return {
    key: exception.key,
    code: exception.code,
    kind: exception.kind,
    details: serializeUnknown(details, new WeakSet<object>()),
  };
}

function serializeErrorForLog(error: unknown): Record<string, Serializable> {
  if (isBaseRpcException(error)) {
    return serializeBaseRpcExceptionForLog(error);
  }

  if (isBaseException(error)) {
    return serializeBaseExceptionForLog(error);
  }

  if (error instanceof Error || isErrorLikeRecord(error)) {
    return serializeErrorLike(error, new WeakSet<object>()) as Record<string, Serializable>;
  }

  return {
    message: typeof error === 'string' ? error : 'Unknown error',
    error: serializeUnknown(error, new WeakSet<object>()),
  };
}

export { serializeErrorForLog };
