import { RequestContext } from '@big-d/api-utils';
import {
  ACTOR_INITIATOR_HEADER_KEY,
  ACTOR_USER_ID_HEADER_KEY,
  createObservabilityLogger,
  type ApplicationLog,
  type LogWriter,
} from '@big-d/observability';
import { ObservabilityContextStorage } from '@big-d/observability/nest';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { TrainingServiceRequestContext } from '@shared/request-context';
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
    service: { name: 'training-service', version: 'test', environment: 'test' },
    writer,
  });
  const interceptor = new RmqObservabilityInterceptor(logger, storage);
  const payload = { data: { trainingId: 10, userId: 26 } };
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
  const rmqContext = new RmqContext([message, {}, 'training.get']);
  const executionContext = {
    switchToRpc: () => ({
      getContext: () => rmqContext,
      getData: () => payload,
    }),
  } as unknown as ExecutionContext;

  return { executionContext, interceptor, payload, storage, writer };
}

describe('RmqObservabilityInterceptor', () => {
  it('logs an inbound request and success in TrainingServiceRequestContext', async () => {
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
        return of({ id: 10 });
      },
    };

    const response = await TrainingServiceRequestContext.run(
      new RequestContext({ source: 'rmq', correlationId: 'cid-123', userTimezone: 'Asia/Novosibirsk' }),
      () => firstValueFrom(interceptor.intercept(executionContext, next)),
    );

    expect(response).toEqual({ id: 10 });
    expect(writer.logs).toHaveLength(2);
    expect(writer.logs[0]).toMatchObject({
      message: 'rmq.request',
      trace: { correlationId: 'cid-123' },
      actor: { initiator: 'user', userId: 26 },
      event: { name: 'training.get', kind: 'request' },
      transport: {
        type: 'rmq',
        direction: 'inbound',
        operation: 'training.get',
        routingKey: 'training.get',
        messageId: 'message-1',
        deliveryTag: 7,
        redelivered: true,
      },
      request: { payload },
    });
    expect(writer.logs[1]).toMatchObject({
      message: 'rmq.done',
      event: { name: 'training.get', kind: 'result', outcome: 'success' },
      result: {},
    });
  });

  it('logs and preserves the original handler error', async () => {
    const error = Object.assign(new Error('Training infrastructure error'), {
      key: 'TRAINING_INFRASTRUCTURE_ERROR',
      code: 'TS-I-0000',
    });
    const { executionContext, interceptor, writer } = createFixture();
    const result = TrainingServiceRequestContext.run(
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
        message: 'Training infrastructure error',
        key: 'TRAINING_INFRASTRUCTURE_ERROR',
        code: 'TS-I-0000',
      },
    });
  });

  it('requires TrainingServiceRequestContext to be initialized first', () => {
    const { executionContext, interceptor } = createFixture();

    expect(() => interceptor.intercept(executionContext, { handle: () => of(null) })).toThrow('BAD_REQUEST');
  });
});
