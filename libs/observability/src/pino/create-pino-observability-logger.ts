import type { ServiceLog } from '../contracts';
import { createObservabilityLogger, type ObservabilityClock, type ObservabilityLogger } from '../core';
import pino, { type DestinationStream, type LevelWithSilent } from 'pino';
import { PinoLogWriter } from './pino-log-writer';
import { createObservabilityPinoOptions, type ObservabilityPinoOptions } from './pino-options';

interface CreatePinoObservabilityLoggerOptions {
  readonly service: ServiceLog;
  /** Minimum Pino level. Defaults to `info`. */
  readonly level?: LevelWithSilent;
  /** Enables the shared local-development pino-pretty transport. */
  readonly pretty?: boolean;
  /** Additional low-level Pino and redaction configuration. */
  readonly pinoOptions?: Omit<ObservabilityPinoOptions, 'level' | 'transport'>;
  /** Optional clock used by tests or deterministic integrations. */
  readonly clock?: ObservabilityClock;
  /** Optional Pino destination used by tests or custom process integrations. */
  readonly destination?: DestinationStream;
}

function createPinoObservabilityLogger(options: CreatePinoObservabilityLoggerOptions): ObservabilityLogger {
  const { service, level = 'info', pretty = false, pinoOptions, clock, destination } = options;
  const loggerOptions = createObservabilityPinoOptions({
    ...pinoOptions,
    level,
    ...(pretty
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: false,
              ignore: 'pid,hostname',
            },
          },
        }
      : {}),
  });
  const logger = destination == null ? pino(loggerOptions) : pino(loggerOptions, destination);

  return createObservabilityLogger({
    service,
    writer: new PinoLogWriter(logger),
    clock,
  });
}

export { createPinoObservabilityLogger, type CreatePinoObservabilityLoggerOptions };
