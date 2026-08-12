import { RequestContext } from '@big-d/api-utils';
import { ExceptionTaskInfrastructure } from '@/modules/tasks/infrastructure/exceptions';
import {
  ACTOR_INITIATOR_HEADER_KEY,
  ACTOR_USER_ID_HEADER_KEY,
  createObservabilityLogger,
  projectPostgresqlError,
  type ApplicationLog,
  type LogWriter,
} from '@big-d/observability';
import { ObservabilityContextStorage } from '@big-d/observability/nest';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { GoalServiceRequestContext } from '@shared/request-context';
import { firstValueFrom, of, throwError } from 'rxjs';
import { RmqObservabilityInterceptor } from './rmq-observability.interceptor';

class MemoryLogWriter implements LogWriter {
  readonly logs: ApplicationLog[] = [];

  write(log: ApplicationLog): void {
    this.logs.push(log);
  }
}

function createFixture(input?: { headers?: Record<string, unknown>; messageId?: string; redelivered?: boolean }) {
  const writer = new MemoryLogWriter();
  const storage = new ObservabilityContextStorage();
  const logger = createObservabilityLogger({
    service: { name: 'goal-service', version: 'test', environment: 'test' },
    writer,
  });
  const interceptor = new RmqObservabilityInterceptor(logger, storage);
  const payload = { data: { taskId: 'o::431', userId: 26 } };
  const message = {
    properties: {
      headers: input?.headers ?? {},
      messageId: input?.messageId,
    },
    fields: {
      deliveryTag: 7,
      redelivered: input?.redelivered ?? false,
    },
  };
  const rmqContext = new RmqContext([message, {}, 'goal.task.replace']);
  const executionContext = {
    switchToRpc: () => ({
      getContext: () => rmqContext,
      getData: () => payload,
    }),
  } as unknown as ExecutionContext;

  return { executionContext, interceptor, payload, storage, writer };
}

describe('RmqObservabilityInterceptor', () => {
  it('logs an inbound RMQ request and success using GoalServiceRequestContext', async () => {
    const { executionContext, interceptor, payload, storage, writer } = createFixture({
      headers: {
        [ACTOR_INITIATOR_HEADER_KEY]: 'user',
        [ACTOR_USER_ID_HEADER_KEY]: 26,
      },
      messageId: 'message-1',
      redelivered: true,
    });
    const next: CallHandler = {
      handle: () => {
        expect(storage.require()).toEqual({
          trace: { correlationId: 'cid-123' },
          actor: { initiator: 'user', userId: 26 },
          propagation: { userTimezone: 'Asia/Novosibirsk' },
        });
        return of({ id: 'o::431' });
      },
    };

    const response = await GoalServiceRequestContext.run(
      new RequestContext({
        source: 'rmq',
        correlationId: 'cid-123',
        userTimezone: 'Asia/Novosibirsk',
      }),
      () => firstValueFrom(interceptor.intercept(executionContext, next)),
    );

    expect(response).toEqual({ id: 'o::431' });
    expect(writer.logs).toHaveLength(2);
    expect(writer.logs[0]).toMatchObject({
      message: 'rmq.request',
      trace: { correlationId: 'cid-123' },
      actor: { initiator: 'user', userId: 26 },
      event: { name: 'goal.task.replace', kind: 'request' },
      transport: {
        type: 'rmq',
        direction: 'inbound',
        operation: 'goal.task.replace',
        routingKey: 'goal.task.replace',
        messageId: 'message-1',
        deliveryTag: 7,
        redelivered: true,
      },
      request: { payload },
    });
    expect(writer.logs[1]).toMatchObject({
      message: 'rmq.done',
      event: { name: 'goal.task.replace', kind: 'result', outcome: 'success' },
      result: {},
    });
  });

  it('logs and preserves the original handler error', async () => {
    const error = Object.assign(new Error('Task infrastructure error'), {
      key: 'TASK_INFRASTRUCTURE_ERROR',
      code: 'GT-I-0000',
    });
    const { executionContext, interceptor, writer } = createFixture();

    const result = GoalServiceRequestContext.run(
      new RequestContext({ source: 'rmq', correlationId: 'cid-error' }),
      () => firstValueFrom(interceptor.intercept(executionContext, { handle: () => throwError(() => error) })),
    );

    await expect(result).rejects.toBe(error);
    expect(writer.logs[1]).toMatchObject({
      message: 'rmq.error',
      trace: { correlationId: 'cid-error' },
      actor: { initiator: 'anonymous' },
      event: { outcome: 'failure' },
      error: {
        message: 'Task infrastructure error',
        key: 'TASK_INFRASTRUCTURE_ERROR',
        code: 'GT-I-0000',
      },
    });
  });

  it('logs complete projected repository diagnostics', async () => {
    const databaseError = Object.assign(new Error('duplicate key value violates unique constraint'), {
      name: 'DatabaseError',
      code: '23505',
      severity: 'ERROR',
      schema: 'public',
      table: 'tasks_recurrences_overrides',
      column: 'r_start',
      constraint: 'tasks_recurrences_override_r_id_r_start_unique',
      detail: 'Key (r_id, r_start) already exists.',
      routine: '_bt_check_unique',
    });
    const error = new ExceptionTaskInfrastructure({
      operation: 'tasks.upsert-override',
      error: projectPostgresqlError(databaseError),
    });
    const { executionContext, interceptor, writer } = createFixture();

    const result = GoalServiceRequestContext.run(
      new RequestContext({ source: 'rmq', correlationId: 'cid-database-error' }),
      () => firstValueFrom(interceptor.intercept(executionContext, { handle: () => throwError(() => error) })),
    );

    await expect(result).rejects.toBe(error);
    expect(writer.logs[1]).toMatchObject({
      message: 'rmq.error',
      trace: { correlationId: 'cid-database-error' },
      error: {
        key: 'TASK_INFRASTRUCTURE_ERROR',
        code: 'GT-I-0000',
        operation: 'tasks.upsert-override',
        cause: {
          type: 'DatabaseError',
          message: 'duplicate key value violates unique constraint',
          code: '23505',
          retryable: false,
          severity: 'ERROR',
          schema: 'public',
          table: 'tasks_recurrences_overrides',
          column: 'r_start',
          constraint: 'tasks_recurrences_override_r_id_r_start_unique',
          detail: 'Key (r_id, r_start) already exists.',
          routine: '_bt_check_unique',
        },
      },
    });
  });

  it('requires GoalServiceRequestContext to be initialized first', () => {
    const { executionContext, interceptor } = createFixture();

    expect(() => interceptor.intercept(executionContext, { handle: () => of(null) })).toThrow('BAD_REQUEST');

    try {
      interceptor.intercept(executionContext, { handle: () => of(null) });
    } catch (error) {
      expect(error).toMatchObject({
        details: { message: 'GoalServiceRequestContext is not initialized' },
      });
    }
  });
});
