/** Correlates all logs produced by one distributed operation. */
interface TraceLog {
  /** Required ID created at the first system boundary and propagated unchanged. */
  readonly correlationId: string;

  /** OpenTelemetry trace ID when tracing is enabled. */
  readonly traceId?: string;

  /** OpenTelemetry span ID when tracing is enabled. */
  readonly spanId?: string;
}

export { type TraceLog };
