import { createPinoRedactOptions } from './pino-redaction';
import type { LoggerOptions } from 'pino';

type PinoFormatters = NonNullable<LoggerOptions['formatters']>;

type ObservabilityPinoOptions = Omit<LoggerOptions, 'formatters' | 'redact' | 'timestamp'> & {
  /** Service-specific paths appended to the mandatory redaction paths. */
  readonly additionalRedactPaths?: readonly string[];

  /** Additional formatters. The string level formatter is owned by the integration. */
  readonly formatters?: Omit<PinoFormatters, 'level'>;
};

/** Creates Pino options compatible with the shared application log contract. */
function createObservabilityPinoOptions(options: ObservabilityPinoOptions = {}): LoggerOptions {
  const { additionalRedactPaths, base = null, formatters, ...pinoOptions } = options;

  return {
    ...pinoOptions,
    base,
    timestamp: false,
    formatters: {
      ...formatters,
      level: (label) => ({ level: label }),
    },
    redact: createPinoRedactOptions(additionalRedactPaths),
  };
}

export { createObservabilityPinoOptions, type ObservabilityPinoOptions };
