import type {
  ApplicationDatabaseErrorLog,
  ApplicationFailureLog,
  ApplicationLifecycleLog,
  ApplicationLogBase,
  ApplicationRequestLog,
  ApplicationSuccessLog,
  RequestLog,
  RequestTransportLog,
  ServiceLog,
} from '../contracts';
import { serializeError } from '../errors';
import { systemObservabilityClock, type ObservabilityClock } from './clock';
import type { LogWriter } from './log-writer';
import type {
  ContextualLogger,
  DatabaseFailureLogInput,
  LifecycleLogInput,
  ObservabilityContext,
  ObservabilityLogger,
  ObservabilityLoggerOptions,
  OperationFailureInput,
  OperationScope,
  OperationSuccessInput,
  StartOperationInput,
} from './logger.types';

const LOG_SCHEMA_VERSION = 1 as const;
const DURATION_PRECISION = 1;

class DefaultObservabilityLogger implements ObservabilityLogger {
  constructor(
    private readonly service: ServiceLog,
    private readonly writer: LogWriter,
    private readonly clock: ObservabilityClock,
  ) {}

  withContext(context: ObservabilityContext): ContextualLogger {
    return new DefaultContextualLogger(this.service, context, this.writer, this.clock);
  }
}

class DefaultContextualLogger implements ContextualLogger {
  constructor(
    private readonly service: ServiceLog,
    private readonly context: ObservabilityContext,
    private readonly writer: LogWriter,
    private readonly clock: ObservabilityClock,
  ) {}

  startOperation<TTransport extends RequestTransportLog>(
    input: StartOperationInput<TTransport>,
  ): OperationScope<TTransport> {
    const startedAt = this.clock.monotonicNow();
    const request = input.request ?? {};
    const log: ApplicationRequestLog = {
      ...this.getBaseLog('info', `${input.transport.type}.request`),
      event: {
        name: input.name,
        kind: 'request',
      },
      transport: input.transport,
      request,
    };

    this.writer.write(log);

    return new DefaultOperationScope(
      input.name,
      input.transport,
      request,
      startedAt,
      (level, message) => this.getBaseLog(level, message),
      this.writer,
      this.clock,
    );
  }

  lifecycle(input: LifecycleLogInput): void {
    const log: ApplicationLifecycleLog = {
      ...this.getBaseLog('info', input.name),
      event: {
        name: input.name,
        kind: 'internal',
        outcome: 'success',
        ...(input.durationMs == null ? {} : { durationMs: roundDurationMs(input.durationMs) }),
      },
    };

    this.writer.write(log);
  }

  databaseFailure(error: unknown, input: DatabaseFailureLogInput): void {
    const log: ApplicationDatabaseErrorLog = {
      ...this.getBaseLog('error', 'database.error'),
      event: {
        name: 'database.error',
        kind: 'internal',
        outcome: 'failure',
        ...(input.durationMs == null ? {} : { durationMs: roundDurationMs(input.durationMs) }),
      },
      transport: input.transport,
      error: serializeError(error),
    };

    this.writer.write(log);
  }

  private getBaseLog(level: ApplicationLogBase['level'], message: string): ApplicationLogBase {
    return {
      schemaVersion: LOG_SCHEMA_VERSION,
      timestamp: this.clock.now().toISOString(),
      level,
      message,
      service: this.service,
      trace: this.context.trace,
      actor: this.context.actor,
    };
  }
}

type GetBaseLog = (level: ApplicationLogBase['level'], message: string) => ApplicationLogBase;

class DefaultOperationScope<TTransport extends RequestTransportLog> implements OperationScope<TTransport> {
  private completed = false;

  constructor(
    private readonly name: string,
    private readonly initialTransport: TTransport,
    private readonly request: RequestLog,
    private readonly startedAt: number,
    private readonly getBaseLog: GetBaseLog,
    private readonly writer: LogWriter,
    private readonly clock: ObservabilityClock,
  ) {}

  success(input: OperationSuccessInput<TTransport> = {}): boolean {
    if (!this.beginCompletion()) return false;

    const transport = input.transport ?? this.initialTransport;
    const log: ApplicationSuccessLog = {
      ...this.getBaseLog('info', `${transport.type}.done`),
      event: {
        name: this.name,
        kind: 'result',
        outcome: 'success',
        durationMs: this.getDurationMs(),
      },
      transport,
      result: input.result ?? {},
    };

    this.writer.write(log);
    return true;
  }

  failure(error: unknown, input: OperationFailureInput<TTransport> = {}): boolean {
    if (!this.beginCompletion()) return false;

    const transport = input.transport ?? this.initialTransport;
    const log: ApplicationFailureLog = {
      ...this.getBaseLog('error', `${transport.type}.error`),
      event: {
        name: this.name,
        kind: 'result',
        outcome: 'failure',
        durationMs: this.getDurationMs(),
      },
      transport,
      request: this.request,
      error: serializeError(error),
    };

    this.writer.write(log);
    return true;
  }

  private beginCompletion(): boolean {
    if (this.completed) return false;

    this.completed = true;
    return true;
  }

  private getDurationMs(): number {
    return roundDurationMs(Math.max(0, this.clock.monotonicNow() - this.startedAt));
  }
}

function roundDurationMs(durationMs: number): number {
  return Number(durationMs.toFixed(DURATION_PRECISION));
}

function createObservabilityLogger(options: ObservabilityLoggerOptions): ObservabilityLogger {
  return new DefaultObservabilityLogger(options.service, options.writer, options.clock ?? systemObservabilityClock);
}

export { createObservabilityLogger, LOG_SCHEMA_VERSION };
