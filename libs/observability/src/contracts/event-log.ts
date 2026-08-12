/** Describes the start of a transport operation. */
interface RequestEventLog {
  /** Stable business operation, for example `task.update`. */
  readonly name: string;
  readonly kind: 'request';
  readonly outcome?: never;
  readonly durationMs?: never;
}

/** Describes a completed transport operation. */
type ResultEventLog =
  | {
      /** Must match the business operation from the request log. */
      readonly name: string;
      readonly kind: 'result';
      readonly outcome: 'success';
      /** Total operation duration in milliseconds. */
      readonly durationMs: number;
    }
  | {
      /** Must match the business operation from the request log. */
      readonly name: string;
      readonly kind: 'result';
      readonly outcome: 'failure';
      /** Total operation duration in milliseconds. */
      readonly durationMs: number;
    };

/** Successful service lifecycle event emitted outside a transport request. */
interface LifecycleEventLog {
  readonly name: 'service.started' | 'service.stopped';
  readonly kind: 'internal';
  readonly outcome: 'success';
  readonly durationMs?: number;
}

/** Database failure emitted outside an already logged transport failure. */
interface DatabaseErrorEventLog {
  readonly name: 'database.error';
  readonly kind: 'internal';
  readonly outcome: 'failure';
  readonly durationMs?: number;
}

type EventLog = RequestEventLog | ResultEventLog | LifecycleEventLog | DatabaseErrorEventLog;

export { type DatabaseErrorEventLog, type EventLog, type LifecycleEventLog, type RequestEventLog, type ResultEventLog };
