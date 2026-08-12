import type { ActorLog } from './actor-log';
import type { ErrorLog } from './error-log';
import type { DatabaseErrorEventLog, LifecycleEventLog, RequestEventLog, ResultEventLog } from './event-log';
import type { RequestLog } from './request-log';
import type { ResultLog } from './result-log';
import type { ServiceLog } from './service-log';
import type { LogLevel, LogSchemaVersion } from './shared';
import type { TraceLog } from './trace-log';
import type { DatabaseTransportLog, RequestTransportLog } from './transport-log';

interface ApplicationLogBase {
  readonly schemaVersion: LogSchemaVersion;
  /** ISO 8601 timestamp in UTC. */
  readonly timestamp: string;
  readonly level: LogLevel;
  /** Stable machine-readable identifier such as `rmq.request` or `http.error`. */
  readonly message: string;
  readonly service: ServiceLog;
  readonly trace: TraceLog;
  readonly actor: ActorLog;
}

/** Start of an inbound or outbound transport operation. */
interface ApplicationRequestLog extends ApplicationLogBase {
  readonly event: RequestEventLog;
  readonly transport: RequestTransportLog;
  readonly request: RequestLog;
  readonly result?: never;
  readonly error?: never;
}

/** Successful completion. Contains result metadata but never request or response payloads. */
interface ApplicationSuccessLog extends ApplicationLogBase {
  readonly event: Extract<ResultEventLog, { outcome: 'success' }>;
  readonly transport: RequestTransportLog;
  readonly result: ResultLog;
  readonly request?: never;
  readonly error?: never;
}

/** Failed transport operation containing its sanitized request and complete internal error. */
interface ApplicationFailureLog extends ApplicationLogBase {
  readonly event: Extract<ResultEventLog, { outcome: 'failure' }>;
  readonly transport: RequestTransportLog;
  readonly request: RequestLog;
  readonly error: ErrorLog;
  readonly result?: never;
}

/** Successful process lifecycle event emitted outside transport handling. */
interface ApplicationLifecycleLog extends ApplicationLogBase {
  readonly event: LifecycleEventLog;
  readonly transport?: never;
  readonly request?: never;
  readonly result?: never;
  readonly error?: never;
}

/**
 * Standalone database failure.
 * Do not emit it when the same failure is already present in a transport error's cause chain.
 */
interface ApplicationDatabaseErrorLog extends ApplicationLogBase {
  readonly event: DatabaseErrorEventLog;
  readonly transport: DatabaseTransportLog;
  readonly error: ErrorLog;
  readonly request?: never;
  readonly result?: never;
}

type ApplicationInternalLog = ApplicationLifecycleLog | ApplicationDatabaseErrorLog;

type ApplicationLog = ApplicationRequestLog | ApplicationSuccessLog | ApplicationFailureLog | ApplicationInternalLog;

export {
  type ApplicationDatabaseErrorLog,
  type ApplicationFailureLog,
  type ApplicationInternalLog,
  type ApplicationLifecycleLog,
  type ApplicationLog,
  type ApplicationLogBase,
  type ApplicationRequestLog,
  type ApplicationSuccessLog,
};
