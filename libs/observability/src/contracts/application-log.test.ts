import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  ActorLog,
  ApplicationDatabaseErrorLog,
  ApplicationFailureLog,
  ApplicationLifecycleLog,
  ApplicationLog,
  ApplicationRequestLog,
  ApplicationSuccessLog,
  ErrorLog,
} from '.';

const baseLog = {
  schemaVersion: 1,
  timestamp: '2026-08-12T03:30:15.421Z',
  level: 'info',
  message: 'rmq.request',
  service: {
    name: 'goal-service',
    version: 'a1b2c3d',
    environment: 'dev-stage',
  },
  trace: {
    correlationId: '5158cf08-65c1-40cc-83f5-236216e2904d',
  },
  actor: {
    initiator: 'user',
    userId: 26,
  },
} as const;

const rmqTransport = {
  type: 'rmq',
  direction: 'inbound',
  operation: 'goal.replace-task.command',
  routingKey: 'goal.replace-task.command',
} as const;

const error: ErrorLog = {
  type: 'ExceptionTaskInfrastructure',
  message: 'Task infrastructure error',
  key: 'TASK_INFRASTRUCTURE_ERROR',
  code: 'GT-I-0000',
  cause: {
    type: 'PostgresError',
    message: 'duplicate key value violates unique constraint',
    code: '23505',
    constraint: 'tasks_recurrences_override_r_id_r_start_unique',
  },
};

describe('application log contracts', () => {
  it('accepts strict request, success and failure logs', () => {
    const requestLog = {
      ...baseLog,
      event: {
        name: 'task.update',
        kind: 'request',
      },
      transport: rmqTransport,
      request: {
        payload: { id: 'v::10::2026-08-20T20:04' },
      },
    } satisfies ApplicationRequestLog;

    const successLog = {
      ...baseLog,
      message: 'rmq.done',
      event: {
        name: 'task.update',
        kind: 'result',
        outcome: 'success',
        durationMs: 42,
      },
      transport: rmqTransport,
      result: {
        entityType: 'task',
        entityId: 'o::15',
      },
    } satisfies ApplicationSuccessLog;

    const failureLog = {
      ...baseLog,
      level: 'error',
      message: 'rmq.error',
      event: {
        name: 'task.update',
        kind: 'result',
        outcome: 'failure',
        durationMs: 37,
      },
      transport: rmqTransport,
      request: {
        payload: { id: 'v::10::2026-08-20T20:04' },
      },
      error,
    } satisfies ApplicationFailureLog;

    expectTypeOf(requestLog).toExtend<ApplicationLog>();
    expectTypeOf(successLog).toExtend<ApplicationLog>();
    expectTypeOf(failureLog).toExtend<ApplicationLog>();
    expect(failureLog.error.cause?.code).toBe('23505');
  });

  it('accepts only explicitly supported internal log variants', () => {
    const lifecycleLog = {
      ...baseLog,
      message: 'service.started',
      actor: { initiator: 'system' },
      event: {
        name: 'service.started',
        kind: 'internal',
        outcome: 'success',
      },
    } satisfies ApplicationLifecycleLog;

    const databaseErrorLog = {
      ...baseLog,
      level: 'error',
      message: 'database.error',
      event: {
        name: 'database.error',
        kind: 'internal',
        outcome: 'failure',
      },
      transport: {
        type: 'database',
        direction: 'outbound',
        operation: 'tasks.upsert-override',
        system: 'postgresql',
        table: 'tasks_recurrences_overrides',
      },
      error,
    } satisfies ApplicationDatabaseErrorLog;

    expectTypeOf(lifecycleLog).toExtend<ApplicationLog>();
    expectTypeOf(databaseErrorLog).toExtend<ApplicationLog>();
  });

  it('requires a userId for user actors', () => {
    const acceptActor = (actor: ActorLog) => actor;

    expect(acceptActor({ initiator: 'anonymous' })).toEqual({ initiator: 'anonymous' });

    // @ts-expect-error A user actor must always include userId.
    acceptActor({ initiator: 'user' });
  });

  it('requires correlationId and rejects incompatible sections', () => {
    const requestWithoutTrace = {
      ...baseLog,
      trace: undefined,
      event: { name: 'task.update', kind: 'request' },
      transport: rmqTransport,
      request: {},
    } as const;

    // @ts-expect-error Every application log must contain trace.correlationId.
    const invalidRequest: ApplicationRequestLog = requestWithoutTrace;

    const invalidSuccess: ApplicationSuccessLog = {
      ...baseLog,
      message: 'rmq.done',
      event: {
        name: 'task.update',
        kind: 'result',
        outcome: 'success',
        durationMs: 42,
      },
      transport: rmqTransport,
      result: {},
      // @ts-expect-error A success log must not include the request payload.
      request: {},
    };

    const invalidFailure: ApplicationFailureLog = {
      ...baseLog,
      level: 'error',
      message: 'rmq.error',
      event: {
        name: 'task.update',
        kind: 'result',
        outcome: 'failure',
        durationMs: 42,
      },
      transport: rmqTransport,
      request: {},
      error,
      // @ts-expect-error A failure log must not include result metadata.
      result: {},
    };

    expect(invalidRequest.trace).toBeUndefined();
    expect(invalidSuccess.request).toEqual({});
    expect(invalidFailure.result).toEqual({});
  });
});
