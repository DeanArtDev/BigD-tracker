import { resolveCorrelationId } from '../context';
import type { ContextualLogger, ObservabilityLogger } from '../core';
import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { OBSERVABILITY_LOGGER } from './observability.tokens';

@Injectable()
class ServiceLifecycleLogger implements OnApplicationShutdown {
  private readonly logger: ContextualLogger;

  constructor(@Inject(OBSERVABILITY_LOGGER) logger: ObservabilityLogger) {
    this.logger = logger.withContext({
      trace: { correlationId: resolveCorrelationId(undefined) },
      actor: { initiator: 'system' },
      propagation: { userTimezone: 'UTC' },
    });
  }

  started(durationMs?: number): void {
    this.logger.lifecycle({ name: 'service.started', durationMs });
  }

  onApplicationShutdown(): void {
    this.logger.lifecycle({ name: 'service.stopped' });
  }
}

export { ServiceLifecycleLogger };
