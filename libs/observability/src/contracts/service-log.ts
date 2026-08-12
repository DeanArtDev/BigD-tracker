import type { Environment } from './shared';

/** Identifies the service instance that emitted the log. */
interface ServiceLog {
  /** Stable application name, for example `goal-service`. */
  readonly name: string;

  /** Build version or commit SHA. */
  readonly version: string;

  /** Runtime environment. */
  readonly environment: Environment;

  /** Container name, pod name or hostname when available. */
  readonly instanceId?: string;
}

export { type ServiceLog };
