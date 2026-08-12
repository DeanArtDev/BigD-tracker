import { DEFAULT_MAX_ERROR_DEPTH } from '../errors';
import type { LoggerOptions } from 'pino';

const PINO_REDACTION_CENSOR = '[REDACTED]';

const DEFAULT_SENSITIVE_FIELD_NAMES = [
  'password',
  'passwordConfirmation',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'sessionToken',
  'session',
  'apiKey',
  'secret',
  'clientSecret',
  'authorization',
  'cookie',
  'login',
  'email',
] as const;

const DEFAULT_REQUEST_PAYLOAD_PATHS = [
  'request.payload',
  'request.payload.input',
  'request.payload.data',
  'request.payload.credentials',
] as const;

const DEFAULT_ERROR_DETAILS_PATHS = Array.from(
  { length: DEFAULT_MAX_ERROR_DEPTH },
  (_, depth) => `error${'.cause'.repeat(depth)}.details`,
);

const DEFAULT_PINO_REDACT_PATHS = [
  ...createSensitivePaths(DEFAULT_REQUEST_PAYLOAD_PATHS),
  ...createSensitivePaths(DEFAULT_ERROR_DETAILS_PATHS),
] as const;

function createPinoRedactOptions(additionalPaths: readonly string[] = []): NonNullable<LoggerOptions['redact']> {
  return {
    paths: [...new Set([...DEFAULT_PINO_REDACT_PATHS, ...additionalPaths])],
    censor: PINO_REDACTION_CENSOR,
  };
}

function createSensitivePaths(parentPaths: readonly string[]): string[] {
  return parentPaths.flatMap((parentPath) =>
    DEFAULT_SENSITIVE_FIELD_NAMES.map((fieldName) => `${parentPath}.${fieldName}`),
  );
}

export { DEFAULT_PINO_REDACT_PATHS, DEFAULT_SENSITIVE_FIELD_NAMES, PINO_REDACTION_CENSOR, createPinoRedactOptions };
