/** Sanitized input of an inbound or outbound operation. */
interface RequestLog {
  /** Payload after redaction and size limiting. Raw GraphQL documents are not logged. */
  readonly payload?: unknown;

  /** Payload size after redaction but before truncation. */
  readonly sizeBytes?: number;

  /** Indicates that the payload exceeded the configured logging limit. */
  readonly truncated?: boolean;
}

export { type RequestLog };
