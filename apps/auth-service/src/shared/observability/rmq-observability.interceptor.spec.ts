import { ExceptionAuthInfrastructure } from '@/modules/auth/infrastructure/exceptions';
import { RequestContext } from '@big-d/api-utils';
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
import { AuthServiceRequestContext } from '@shared/request-context';
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
    service: { name: 'auth-service', version: 'test', environment: 'test' },
    writer,
  });
  const interceptor = new RmqObservabilityInterceptor(logger, storage);
  const payload = { data: { email: 'user@example.com' } };
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
  const rmqContext = new RmqContext([message, {}, 'auth.user.login']);
  const executionContext = {
    switchToRpc: () => ({
      getContext: () => rmqContext,
      getData: () => payload,
    }),
  } as unknown as ExecutionContext;

  return { executionContext, interceptor, payload, storage, writer };
}

describe('RmqObservabilityInterceptor', () => {
  it('logs an inbound RMQ request and success using AuthServiceRequestContext', async () => {
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
        return of({ userId: 26 });
      },
    };

    const response = await AuthServiceRequestContext.run(
      new RequestContext({
        source: 'rmq',
        correlationId: 'cid-123',
        userTimezone: 'Asia/Novosibirsk',
      }),
      () => firstValueFrom(interceptor.intercept(executionContext, next)),
    );

    expect(response).toEqual({ userId: 26 });
    expect(writer.logs).toHaveLength(2);
    expect(writer.logs[0]).toMatchObject({
      message: 'rmq.request',
      trace: { correlationId: 'cid-123' },
      actor: { initiator: 'user', userId: 26 },
      event: { name: 'auth.user.login', kind: 'request' },
      transport: {
        type: 'rmq',
        direction: 'inbound',
        operation: 'auth.user.login',
        routingKey: 'auth.user.login',
        messageId: 'message-1',
        deliveryTag: 7,
        redelivered: true,
      },
      request: { payload },
    });
    expect(writer.logs[1]).toMatchObject({
      message: 'rmq.done',
      event: { name: 'auth.user.login', kind: 'result', outcome: 'success' },
      result: {},
    });
  });

  it('logs projected PostgreSQL diagnostics and preserves the original error', async () => {
    const databaseError = Object.assign(new Error('duplicate key value violates unique constraint'), {
      name: 'DatabaseError',
      code: '23505',
      severity: 'ERROR',
      schema: 'public',
      table: 'users',
      constraint: 'users_email_unique',
      detail: 'Key (email) already exists.',
      routine: '_bt_check_unique',
    });
    const error = new ExceptionAuthInfrastructure({
      operation: 'users.create-user',
      error: projectPostgresqlError(databaseError),
    });
    const { executionContext, interceptor, writer } = createFixture();

    const result = AuthServiceRequestContext.run(
      new RequestContext({ source: 'rmq', correlationId: 'cid-database-error' }),
      () => firstValueFrom(interceptor.intercept(executionContext, { handle: () => throwError(() => error) })),
    );

    await expect(result).rejects.toBe(error);
    expect(writer.logs[1]).toMatchObject({
      message: 'rmq.error',
      trace: { correlationId: 'cid-database-error' },
      error: {
        key: 'AUTH_INFRASTRUCTURE_ERROR',
        code: 'ASS-I-0001',
        operation: 'users.create-user',
        cause: {
          type: 'DatabaseError',
          message: 'duplicate key value violates unique constraint',
          code: '23505',
          retryable: false,
          severity: 'ERROR',
          schema: 'public',
          table: 'users',
          constraint: 'users_email_unique',
          detail: 'Key (email) already exists.',
          routine: '_bt_check_unique',
        },
      },
    });
  });

  it('requires AuthServiceRequestContext to be initialized first', () => {
    const { executionContext, interceptor } = createFixture();

    expect(() => interceptor.intercept(executionContext, { handle: () => of(null) })).toThrow('BAD_REQUEST');
  });
});
