/** Metadata of a successful result. The response body must never be included. */
interface ResultLog {
  readonly entityType?: string;

  /** Include when the identifier can be determined reliably. */
  readonly entityId?: string | number;

  /** Use for bulk operations instead of logging an array of entity identifiers. */
  readonly affectedCount?: number;
}

export { type ResultLog };
