import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ApplicationLog, HttpTransportLog, ServiceLog } from '../contracts';
import type { ObservabilityClock } from './clock';
import { createObservabilityLogger, LOG_SCHEMA_VERSION } from '.';
import type { ContextualLogger, LogWriter, ObservabilityLogger } from '.';

class MemoryLogWriter implements LogWriter {
  readonly logs: ApplicationLog[] = [];

  write(log: ApplicationLog): void {
    this.logs.push(log);
  }
}

class FakeClock implements ObservabilityClock {
  wallTime = new Date('2026-08-12T04:00:00.000Z');
  monotonicTime = 100;

  now(): Date {
    return this.wallTime;
  }

  monotonicNow(): number {
    return this.monotonicTime;
  }
}

const service: ServiceLog = {
  name: 'goal-service',
  version: 'a1b2c3d',
  environment: 'dev-stage',
};

const initialTransport = {
  type: 'http',
  direction: 'inbound',
  operation: 'TasksController.update',
  method: 'PATCH',
  route: '/tasks/:taskId',
} as const satisfies HttpTransportLog;

function createTestLogger(): {
  logger: ContextualLogger;
  applicationLogger: ObservabilityLogger;
  writer: MemoryLogWriter;
  clock: FakeClock;
} {
  const writer = new MemoryLogWriter();
  const clock = new FakeClock();
  const applicationLogger = createObservabilityLogger({ service, writer, clock });
  const logger = applicationLogger.withContext({
    trace: {
      correlationId: '5158cf08-65c1-40cc-83f5-236216e2904d',
      traceId: 'trace-id',
      spanId: 'span-id',
    },
    actor: {
      initiator: 'user',
      userId: 26,
    },
    propagation: {
      userTimezone: 'Asia/Novosibirsk',
    },
  });

  return { logger, applicationLogger, writer, clock };
}

describe('createObservabilityLogger', () => {
  it('creates a contextual logger through the public API', () => {
    const { applicationLogger, logger } = createTestLogger();

    expectTypeOf(applicationLogger).toEqualTypeOf<ObservabilityLogger>();
    expectTypeOf(logger).toEqualTypeOf<ContextualLogger>();
    expect(LOG_SCHEMA_VERSION).toBe(1);
  });

  it('writes request and successful completion logs with defaults', () => {
    const { logger, writer, clock } = createTestLogger();
    const operation = logger.startOperation({
      name: 'task.update',
      transport: initialTransport,
    });

    clock.wallTime = new Date('2026-08-12T04:00:00.042Z');
    clock.monotonicTime = 142.831584;

    expect(
      operation.success({
        transport: {
          ...initialTransport,
          statusCode: 200,
        },
      }),
    ).toBe(true);

    expect(writer.logs).toEqual([
      {
        schemaVersion: 1,
        timestamp: '2026-08-12T04:00:00.000Z',
        level: 'info',
        message: 'http.request',
        service,
        trace: {
          correlationId: '5158cf08-65c1-40cc-83f5-236216e2904d',
          traceId: 'trace-id',
          spanId: 'span-id',
        },
        actor: {
          initiator: 'user',
          userId: 26,
        },
        event: {
          name: 'task.update',
          kind: 'request',
        },
        transport: initialTransport,
        request: {},
      },
      {
        schemaVersion: 1,
        timestamp: '2026-08-12T04:00:00.042Z',
        level: 'info',
        message: 'http.done',
        service,
        trace: {
          correlationId: '5158cf08-65c1-40cc-83f5-236216e2904d',
          traceId: 'trace-id',
          spanId: 'span-id',
        },
        actor: {
          initiator: 'user',
          userId: 26,
        },
        event: {
          name: 'task.update',
          kind: 'result',
          outcome: 'success',
          durationMs: 42.8,
        },
        transport: {
          ...initialTransport,
          statusCode: 200,
        },
        result: {},
      },
    ]);
  });

  it('writes a serialized failure with the original request', () => {
    const { logger, writer, clock } = createTestLogger();
    const request = {
      payload: {
        taskId: 'v::10::2026-08-20T20:04',
      },
      sizeBytes: 41,
    };
    const operation = logger.startOperation({
      name: 'task.update',
      transport: initialTransport,
      request,
    });

    clock.wallTime = new Date('2026-08-12T04:00:00.037Z');
    clock.monotonicTime = 137.06;
    const cause = Object.assign(new Error('duplicate key value'), {
      code: '23505',
      constraint: 'tasks_recurrences_override_r_id_r_start_unique',
    });

    expect(
      operation.failure({
        type: 'ExceptionTaskInfrastructure',
        message: 'Task infrastructure error',
        key: 'TASK_INFRASTRUCTURE_ERROR',
        cause,
      }),
    ).toBe(true);

    expect(writer.logs).toHaveLength(2);
    expect(writer.logs[1]).toMatchObject({
      timestamp: '2026-08-12T04:00:00.037Z',
      level: 'error',
      message: 'http.error',
      event: {
        name: 'task.update',
        kind: 'result',
        outcome: 'failure',
        durationMs: 37.1,
      },
      request,
      error: {
        type: 'ExceptionTaskInfrastructure',
        message: 'Task infrastructure error',
        key: 'TASK_INFRASTRUCTURE_ERROR',
        cause: {
          type: 'Error',
          message: 'duplicate key value',
          code: '23505',
          constraint: 'tasks_recurrences_override_r_id_r_start_unique',
        },
      },
    });
  });

  it('keeps correlationId only in trace for failure logs', () => {
    const { logger, writer } = createTestLogger();
    const operation = logger.startOperation({
      name: 'task.update',
      transport: initialTransport,
    });

    operation.failure({
      type: 'GraphQLError',
      message: 'Task infrastructure error',
      details: {
        correlationId: '5158cf08-65c1-40cc-83f5-236216e2904d',
        extensions: {
          correlationId: '5158cf08-65c1-40cc-83f5-236216e2904d',
        },
      },
      cause: {
        type: 'RpcError',
        message: 'Task infrastructure error',
        details: {
          correlationId: '5158cf08-65c1-40cc-83f5-236216e2904d',
        },
      },
    });

    const failureLog = writer.logs[1];
    expect(failureLog.trace.correlationId).toBe('5158cf08-65c1-40cc-83f5-236216e2904d');
    expect(JSON.stringify(failureLog).match(/correlationId/g)).toHaveLength(1);
  });

  it('completes an operation only once without throwing into business code', () => {
    const { logger, writer, clock } = createTestLogger();
    const operation = logger.startOperation({
      name: 'task.update',
      transport: initialTransport,
    });

    clock.monotonicTime = 110;

    expect(operation.success()).toBe(true);
    expect(operation.failure(new Error('late failure'))).toBe(false);
    expect(operation.success()).toBe(false);
    expect(writer.logs).toHaveLength(2);
  });

  it('writes lifecycle and standalone database failure logs', () => {
    const { logger, writer } = createTestLogger();

    logger.lifecycle({ name: 'service.started', durationMs: 110.83158400000002 });
    logger.databaseFailure(new Error('connection refused'), {
      transport: {
        type: 'database',
        direction: 'outbound',
        operation: 'tasks.upsert-override',
        system: 'postgresql',
        table: 'tasks_recurrences_overrides',
      },
      durationMs: 12.34,
    });

    expect(writer.logs).toEqual([
      expect.objectContaining({
        level: 'info',
        message: 'service.started',
        event: {
          name: 'service.started',
          kind: 'internal',
          outcome: 'success',
          durationMs: 110.8,
        },
      }),
      expect.objectContaining({
        level: 'error',
        message: 'database.error',
        event: {
          name: 'database.error',
          kind: 'internal',
          outcome: 'failure',
          durationMs: 12.3,
        },
        transport: {
          type: 'database',
          direction: 'outbound',
          operation: 'tasks.upsert-override',
          system: 'postgresql',
          table: 'tasks_recurrences_overrides',
        },
        error: expect.objectContaining({
          type: 'Error',
          message: 'connection refused',
        }),
      }),
    ]);
  });
});
