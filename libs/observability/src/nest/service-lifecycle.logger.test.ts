import type { ObservabilityLogger } from '../core';
import { describe, expect, it, vi } from 'vitest';
import { ServiceLifecycleLogger } from './service-lifecycle.logger';

describe('ServiceLifecycleLogger', () => {
  it('logs process start and graceful shutdown in one system context', () => {
    const lifecycle = vi.fn();
    const withContext = vi.fn(() => ({ lifecycle }));
    const logger = { withContext } as unknown as ObservabilityLogger;
    const serviceLifecycle = new ServiceLifecycleLogger(logger);

    serviceLifecycle.started(125);
    serviceLifecycle.onApplicationShutdown();

    expect(withContext).toHaveBeenCalledWith({
      trace: { correlationId: expect.any(String) },
      actor: { initiator: 'system' },
      propagation: { userTimezone: 'UTC' },
    });
    expect(lifecycle).toHaveBeenNthCalledWith(1, { name: 'service.started', durationMs: 125 });
    expect(lifecycle).toHaveBeenNthCalledWith(2, { name: 'service.stopped' });
  });
});
