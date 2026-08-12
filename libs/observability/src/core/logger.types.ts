import type {
  ActorLog,
  DatabaseTransportLog,
  LifecycleEventLog,
  RequestLog,
  RequestTransportLog,
  ResultLog,
  ServiceLog,
  TraceLog,
} from '../contracts';
import type { ObservabilityClock } from './clock';
import type { LogWriter } from './log-writer';

interface ObservabilityLoggerOptions {
  readonly service: ServiceLog;
  readonly writer: LogWriter;
  readonly clock?: ObservabilityClock;
}

interface ObservabilityContext {
  readonly trace: TraceLog;
  readonly actor: ActorLog;
  /** Values propagated between transports without being written to every log. */
  readonly propagation: {
    /** Normalized IANA timezone of the initiating request. */
    readonly userTimezone: string;
  };
}

interface StartOperationInput<TTransport extends RequestTransportLog = RequestTransportLog> {
  /** Stable business operation, for example `task.update`. */
  readonly name: string;
  readonly transport: TTransport;
  /** Sanitized request metadata. Defaults to an empty object. */
  readonly request?: RequestLog;
}

type MatchingRequestTransport<TTransport extends RequestTransportLog> = Extract<
  RequestTransportLog,
  { type: TTransport['type'] }
>;

interface OperationSuccessInput<TTransport extends RequestTransportLog = RequestTransportLog> {
  /** Final transport metadata, for example HTTP metadata containing `statusCode`. */
  readonly transport?: MatchingRequestTransport<TTransport>;
  /** Result metadata without a response body. Defaults to an empty object. */
  readonly result?: ResultLog;
}

interface OperationFailureInput<TTransport extends RequestTransportLog = RequestTransportLog> {
  /** Final transport metadata, for example HTTP metadata containing `statusCode`. */
  readonly transport?: MatchingRequestTransport<TTransport>;
}

/** A single request operation that can be completed exactly once. */
interface OperationScope<TTransport extends RequestTransportLog = RequestTransportLog> {
  /** Writes a successful result log. Returns false when the scope was already completed. */
  success(input?: OperationSuccessInput<TTransport>): boolean;

  /** Writes a failure log and serializes the error. Returns false when the scope was already completed. */
  failure(error: unknown, input?: OperationFailureInput<TTransport>): boolean;
}

interface LifecycleLogInput {
  readonly name: LifecycleEventLog['name'];
  readonly durationMs?: number;
}

interface DatabaseFailureLogInput {
  readonly transport: DatabaseTransportLog;
  readonly durationMs?: number;
}

interface ContextualLogger {
  /** Writes the request log immediately and returns its completion scope. */
  startOperation<TTransport extends RequestTransportLog>(
    input: StartOperationInput<TTransport>,
  ): OperationScope<TTransport>;

  /** Writes a supported service lifecycle event. */
  lifecycle(input: LifecycleLogInput): void;

  /** Writes a standalone database error that is not already part of a transport failure. */
  databaseFailure(error: unknown, input: DatabaseFailureLogInput): void;
}

interface ObservabilityLogger {
  /** Binds trace and actor metadata to all logs produced by the returned logger. */
  withContext(context: ObservabilityContext): ContextualLogger;
}

export type {
  ContextualLogger,
  DatabaseFailureLogInput,
  LifecycleLogInput,
  MatchingRequestTransport,
  ObservabilityContext,
  ObservabilityLogger,
  ObservabilityLoggerOptions,
  OperationFailureInput,
  OperationScope,
  OperationSuccessInput,
  StartOperationInput,
};
