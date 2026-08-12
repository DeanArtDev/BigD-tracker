import { describe, expect, it } from 'vitest';
import { createObservabilityLogger } from '../core';
import type { ObservabilityClock } from '../core';
import {
  DEFAULT_PINO_REDACT_PATHS,
  PINO_REDACTION_CENSOR,
  PinoLogWriter,
  createObservabilityPinoOptions,
  createPinoObservabilityLogger,
  createPinoRedactOptions,
} from '.';
import pino from 'pino';

const fixedClock: ObservabilityClock = {
  now: () => new Date('2026-08-12T05:00:00.000Z'),
  monotonicNow: () => 100,
};

function createMemoryDestination(): { chunks: string[]; destination: { write(chunk: string): void } } {
  const chunks: string[] = [];

  return {
    chunks,
    destination: {
      write(chunk: string): void {
        chunks.push(chunk);
      },
    },
  };
}

function createTestLogger(additionalRedactPaths: readonly string[] = []) {
  const { chunks, destination } = createMemoryDestination();
  const pinoLogger = pino(
    createObservabilityPinoOptions({
      additionalRedactPaths,
    }),
    destination,
  );
  const writer = new PinoLogWriter(pinoLogger);
  const logger = createObservabilityLogger({
    service: {
      name: 'goal-service',
      version: 'a1b2c3d',
      environment: 'dev-stage',
    },
    writer,
    clock: fixedClock,
  }).withContext({
    trace: {
      correlationId: '5158cf08-65c1-40cc-83f5-236216e2904d',
    },
    actor: {
      initiator: 'user',
      userId: 26,
    },
    propagation: {
      userTimezone: 'Asia/Novosibirsk',
    },
  });

  return { chunks, logger };
}

describe('Pino observability integration', () => {
  it('creates the complete observability logger through the high-level factory', () => {
    const { chunks, destination } = createMemoryDestination();
    const applicationLogger = createPinoObservabilityLogger({
      service: {
        name: 'api-gateway',
        version: 'a1b2c3d',
        environment: 'dev-stage',
      },
      destination,
      clock: fixedClock,
    });
    const logger = applicationLogger.withContext({
      trace: { correlationId: 'cid-factory' },
      actor: { initiator: 'anonymous' },
      propagation: { userTimezone: 'UTC' },
    });

    logger.startOperation({
      name: 'task.get',
      transport: {
        type: 'rmq',
        direction: 'outbound',
        operation: 'goal.task.get',
        routingKey: 'goal.task.get',
      },
    });

    expect(JSON.parse(chunks[0] ?? '')).toMatchObject({
      message: 'rmq.request',
      service: { name: 'api-gateway', version: 'a1b2c3d', environment: 'dev-stage' },
      trace: { correlationId: 'cid-factory' },
    });
  });

  it('writes the application contract without duplicate Pino fields', () => {
    const { chunks, logger } = createTestLogger(['request.payload.privateKey']);

    logger.startOperation({
      name: 'task.update',
      transport: {
        type: 'http',
        direction: 'inbound',
        operation: 'TasksController.update',
        method: 'PATCH',
        route: '/tasks/:taskId',
      },
      request: {
        payload: {
          password: 'raw-password',
          input: {
            accessToken: 'raw-access-token',
          },
          privateKey: 'raw-private-key',
          taskId: 'o::431',
        },
      },
    });

    const rawLog = chunks[0] ?? '';
    const log = JSON.parse(rawLog) as Record<string, unknown>;

    expect(rawLog.match(/"level"/g)).toHaveLength(1);
    expect(rawLog).not.toContain('raw-password');
    expect(rawLog).not.toContain('raw-access-token');
    expect(rawLog).not.toContain('raw-private-key');
    expect(log).toMatchObject({
      level: 'info',
      schemaVersion: 1,
      timestamp: '2026-08-12T05:00:00.000Z',
      message: 'http.request',
      request: {
        payload: {
          password: PINO_REDACTION_CENSOR,
          input: {
            accessToken: PINO_REDACTION_CENSOR,
          },
          privateKey: PINO_REDACTION_CENSOR,
          taskId: 'o::431',
        },
      },
    });
    expect(log).not.toHaveProperty('time');
    expect(log).not.toHaveProperty('msg');
    expect(log).not.toHaveProperty('pid');
    expect(log).not.toHaveProperty('hostname');
  });

  it('redacts error details throughout the supported cause depth', () => {
    const { chunks, logger } = createTestLogger();
    const operation = logger.startOperation({
      name: 'task.update',
      transport: {
        type: 'rmq',
        direction: 'inbound',
        operation: 'goal.replace-task.command',
        routingKey: 'goal.replace-task.command',
      },
      request: {},
    });

    operation.failure({
      type: 'TaskInfrastructureError',
      message: 'Task infrastructure error',
      details: {
        token: 'raw-error-token',
      },
      cause: {
        type: 'PostgresError',
        message: 'Database error',
        details: {
          clientSecret: 'raw-client-secret',
          constraint: 'tasks_unique',
        },
      },
    });

    const rawLog = chunks[1] ?? '';
    const log = JSON.parse(rawLog) as Record<string, unknown>;

    expect(rawLog).not.toContain('raw-error-token');
    expect(rawLog).not.toContain('raw-client-secret');
    expect(log).toMatchObject({
      level: 'error',
      message: 'rmq.error',
      error: {
        details: {
          token: PINO_REDACTION_CENSOR,
        },
        cause: {
          details: {
            clientSecret: PINO_REDACTION_CENSOR,
            constraint: 'tasks_unique',
          },
        },
      },
    });
  });

  it('keeps mandatory redaction paths while deduplicating service paths', () => {
    const mandatoryPath = DEFAULT_PINO_REDACT_PATHS[0];
    const servicePath = 'request.payload.providerToken';
    const options = createPinoRedactOptions([mandatoryPath, servicePath, servicePath]);

    expect(options).toEqual({
      paths: [...DEFAULT_PINO_REDACT_PATHS, servicePath],
      censor: PINO_REDACTION_CENSOR,
    });
  });
});
