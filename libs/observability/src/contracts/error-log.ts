/**
 * Complete internal diagnostic error sent to Loki after redaction.
 * It must never be returned to a client.
 */
interface ErrorLog {
  /** Error class or runtime type. */
  readonly type: string;
  /** Original diagnostic message. */
  readonly message: string;
  readonly stack?: string;

  /** Application exception metadata. */
  readonly key?: string;
  readonly code?: string;
  readonly operation?: string;
  readonly retryable?: boolean;

  /** Known PostgreSQL diagnostic fields, kept on the error node they belong to. */
  readonly constraint?: string;
  readonly severity?: string;
  readonly schema?: string;
  readonly table?: string;
  readonly column?: string;
  readonly dataType?: string;
  readonly detail?: string;
  readonly hint?: string;
  readonly position?: string;
  readonly internalPosition?: string;
  readonly where?: string;
  readonly file?: string;
  readonly line?: string;
  readonly routine?: string;

  /** Additional diagnostics after redaction and size limiting. */
  readonly details?: Record<string, unknown>;

  /** Original error wrapped by this error. */
  readonly cause?: ErrorLog;
}

/**
 * Safe error returned to a client and created with an explicit allowlist mapper.
 * It must not be produced by removing fields from {@link ErrorLog}.
 */
interface PublicError {
  readonly key: string;
  readonly code: string;
  readonly message: string;

  /** Allows operators to locate the complete internal error in Loki. */
  readonly correlationId: string;

  /** Only explicitly allowed validation, conflict or not-found details. */
  readonly details?: Record<string, unknown>;
}

export { type ErrorLog, type PublicError };
