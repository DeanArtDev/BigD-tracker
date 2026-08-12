import { describe, expect, it } from 'vitest';
import type { ObservabilityContext } from '../core';
import { ObservabilityContextNotFoundError, ObservabilityContextStorage } from './observability-context-storage';

const parentContext: ObservabilityContext = {
  trace: { correlationId: 'parent-correlation-id' },
  actor: { initiator: 'user', userId: 26 },
  propagation: { userTimezone: 'Asia/Novosibirsk' },
};

const nestedContext: ObservabilityContext = {
  trace: { correlationId: 'nested-correlation-id' },
  actor: { initiator: 'service', serviceName: 'goal-service' },
  propagation: { userTimezone: 'UTC' },
};

describe('ObservabilityContextStorage', () => {
  it('preserves context across promises and timers', async () => {
    const storage = new ObservabilityContextStorage();

    await storage.run(parentContext, async () => {
      await Promise.resolve();
      expect(storage.require()).toBe(parentContext);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(storage.require()).toBe(parentContext);
          resolve();
        }, 0);
      });
    });

    expect(storage.get()).toBeUndefined();
  });

  it('restores the parent context after a nested run', () => {
    const storage = new ObservabilityContextStorage();

    storage.run(parentContext, () => {
      expect(storage.require()).toBe(parentContext);

      storage.run(nestedContext, () => {
        expect(storage.require()).toBe(nestedContext);
      });

      expect(storage.require()).toBe(parentContext);
    });
  });

  it('throws an explicit error outside a context boundary', () => {
    const storage = new ObservabilityContextStorage();

    expect(storage.get()).toBeUndefined();
    expect(() => storage.require()).toThrow(ObservabilityContextNotFoundError);
    expect(() => storage.require()).toThrow('Observability context is not available');
  });

  it('isolates concurrent asynchronous execution chains', async () => {
    const storage = new ObservabilityContextStorage();

    const results = await Promise.all([
      storage.run(parentContext, async () => {
        await Promise.resolve();
        return storage.require().trace.correlationId;
      }),
      storage.run(nestedContext, async () => {
        await Promise.resolve();
        return storage.require().trace.correlationId;
      }),
    ]);

    expect(results).toEqual(['parent-correlation-id', 'nested-correlation-id']);
  });
});
