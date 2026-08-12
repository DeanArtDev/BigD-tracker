import { randomUUID } from 'node:crypto';

const MAX_CORRELATION_ID_LENGTH = 128;
const SAFE_CORRELATION_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;

type CorrelationIdFactory = () => string;

/**
 * Keeps a safe incoming correlation ID or creates a new UUID.
 * Whitespace, control characters and IDs longer than 128 characters are rejected.
 */
function resolveCorrelationId(value: unknown, factory: CorrelationIdFactory = randomUUID): string {
  if (isValidCorrelationId(value)) return value;

  return factory();
}

function isValidCorrelationId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_CORRELATION_ID_LENGTH &&
    SAFE_CORRELATION_ID_PATTERN.test(value)
  );
}

export {
  MAX_CORRELATION_ID_LENGTH,
  SAFE_CORRELATION_ID_PATTERN,
  type CorrelationIdFactory,
  isValidCorrelationId,
  resolveCorrelationId,
};
