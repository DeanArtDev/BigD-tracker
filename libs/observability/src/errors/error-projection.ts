/**
 * Library-owned projection for integrating a custom exception hierarchy.
 *
 * An integration layer may map its exception into this shape without making
 * `@big-d/observability` depend on the exception's package or runtime class.
 */
interface ErrorProjection {
  /** Exception class, category or runtime type. */
  readonly type: string;
  readonly message: string;
  readonly stack?: string;

  readonly key?: string;
  readonly code?: string;
  readonly operation?: string;
  readonly retryable?: boolean;

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

  readonly details?: Record<string, unknown>;
  readonly cause?: unknown;
}

export { type ErrorProjection };
