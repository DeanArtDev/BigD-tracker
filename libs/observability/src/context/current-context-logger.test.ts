import { describe, expect, it } from 'vitest';
import type { ApplicationLog, ServiceLog } from '../contracts';
import { createObservabilityLogger } from '../core';
import type { LogWriter, ObservabilityClock } from '../core';
import { CurrentContextLogger } from './current-context-logger';
import { ObservabilityContextNotFoundError, ObservabilityContextStorage } from './observability-context-storage';

class MemoryLogWriter implements LogWriter {
  readonly logs: ApplicationLog[] = [];

  write(log: ApplicationLog): void {
    this.logs.push(log);
  }
}

const service: ServiceLog = {
  name: 'goal-service',
  version: 'a1b2c3d',
  environment: 'dev-stage',
};

describe('CurrentContextLogger', () => {
  it('forms request and result logs from the active asynchronous context', async () => {
    const writer = new MemoryLogWriter();
    const contextStorage = new ObservabilityContextStorage();
    let monotonicTime = 10;
    const clock: ObservabilityClock = {
      now: () => new Date('2026-08-12T06:00:00.000Z'),
      monotonicNow: () => monotonicTime,
    };
    const applicationLogger = createObservabilityLogger({ service, writer, clock });
    const logger = new CurrentContextLogger(applicationLogger, contextStorage);

    await contextStorage.run(
      {
        trace: {
          correlationId: 'cid-http-123',
          traceId: 'trace-id',
        },
        actor: {
          initiator: 'user',
          userId: 26,
        },
        propagation: {
          userTimezone: 'Asia/Novosibirsk',
        },
      },
      async () => {
        await Promise.resolve();

        const operation = logger.startOperation({
          name: 'task.update',
          transport: {
            type: 'http',
            direction: 'inbound',
            operation: 'TasksController.updateTask',
            method: 'PATCH',
            route: '/tasks/:taskId',
          },
          request: {
            payload: { taskId: 'o::431' },
          },
        });

        monotonicTime = 25;
        operation.success({
          result: {
            entityType: 'task',
            entityId: 'o::431',
          },
        });
      },
    );

    expect(writer.logs).toHaveLength(2);
    expect(writer.logs[0]).toMatchObject({
      message: 'http.request',
      trace: {
        correlationId: 'cid-http-123',
        traceId: 'trace-id',
      },
      actor: {
        initiator: 'user',
        userId: 26,
      },
      request: {
        payload: { taskId: 'o::431' },
      },
    });
    expect(writer.logs[1]).toMatchObject({
      message: 'http.done',
      trace: { correlationId: 'cid-http-123' },
      event: {
        name: 'task.update',
        outcome: 'success',
        durationMs: 15,
      },
      result: {
        entityType: 'task',
        entityId: 'o::431',
      },
    });
  });

  it('fails before writing when used outside a context boundary', () => {
    const writer = new MemoryLogWriter();
    const applicationLogger = createObservabilityLogger({ service, writer });
    const logger = new CurrentContextLogger(applicationLogger, new ObservabilityContextStorage());

    expect(() =>
      logger.startOperation({
        name: 'task.update',
        transport: {
          type: 'rmq',
          direction: 'inbound',
          operation: 'goal.replace-task.command',
          routingKey: 'goal.replace-task.command',
        },
      }),
    ).toThrow(ObservabilityContextNotFoundError);
    expect(writer.logs).toEqual([]);
  });
});
