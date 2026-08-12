import {
  CORRELATION_HEADER_KEY,
  USER_TIME_ZONE_HEADER_KEY,
  ACTOR_INITIATOR_HEADER_KEY,
  ACTOR_USER_ID_HEADER_KEY,
  createObservabilityLogger,
  type ApplicationLog,
  type LogWriter,
} from '@big-d/observability';
import { ObservabilityContextStorage } from '@big-d/observability/nest';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError, TimeoutError } from 'rxjs';
import { AppRmqClient } from './app-client-proxy.service';

class MemoryLogWriter implements LogWriter {
  readonly logs: ApplicationLog[] = [];

  write(log: ApplicationLog): void {
    this.logs.push(log);
  }
}

function createFixture(sendImplementation: (...args: unknown[]) => unknown = () => of({ data: { id: 'o::431' } })) {
  const send = jest.fn<unknown, unknown[]>(sendImplementation);
  const writer = new MemoryLogWriter();
  const contextStorage = new ObservabilityContextStorage();
  const logger = createObservabilityLogger({
    service: {
      name: 'api-gateway',
      version: 'test',
      environment: 'test',
    },
    writer,
  });
  const client = new AppRmqClient({ send } as unknown as ClientProxy, logger, contextStorage, { timeout: 5000 });

  return { client, contextStorage, send, writer };
}

describe('AppRmqClient', () => {
  it('logs an outbound request and successful response in the active context', async () => {
    const { client, contextStorage, send, writer } = createFixture();
    const payload = { data: { taskId: 'o::431', userId: 26 } };

    const response = await contextStorage.run(
      {
        trace: { correlationId: 'cid-123' },
        actor: { initiator: 'user', userId: 26 },
        propagation: { userTimezone: 'Asia/Novosibirsk' },
      },
      () => client.send('goal.task.replace', payload),
    );

    expect(response).toEqual({ data: { id: 'o::431' } });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]?.[0]).toBe('goal.task.replace');
    expect(send.mock.calls[0]?.[1]).toMatchObject({
      data: payload,
      options: {
        headers: {
          [CORRELATION_HEADER_KEY]: 'cid-123',
          [USER_TIME_ZONE_HEADER_KEY]: 'Asia/Novosibirsk',
          [ACTOR_INITIATOR_HEADER_KEY]: 'user',
          [ACTOR_USER_ID_HEADER_KEY]: 26,
        },
      },
    });
    expect(writer.logs).toHaveLength(2);
    expect(writer.logs[0]).toMatchObject({
      level: 'info',
      message: 'rmq.request',
      trace: { correlationId: 'cid-123' },
      actor: { initiator: 'user', userId: 26 },
      event: { name: 'goal.task.replace', kind: 'request' },
      transport: {
        type: 'rmq',
        direction: 'outbound',
        operation: 'goal.task.replace',
        routingKey: 'goal.task.replace',
      },
      request: { payload },
    });
    expect(writer.logs[1]).toMatchObject({
      level: 'info',
      message: 'rmq.done',
      trace: { correlationId: 'cid-123' },
      event: { name: 'goal.task.replace', kind: 'result', outcome: 'success' },
      result: {},
    });
  });

  it('logs an error and rethrows the same failure', async () => {
    const error = Object.assign(new Error('Goal service failed'), {
      key: 'TASK_INFRASTRUCTURE_ERROR',
      code: 'GT-I-0000',
    });
    const { client, contextStorage, writer } = createFixture(() => throwError(() => error));

    const result = contextStorage.run(
      {
        trace: { correlationId: 'cid-error' },
        actor: { initiator: 'user', userId: 26 },
        propagation: { userTimezone: 'UTC' },
      },
      () => client.send('goal.task.replace', { data: { taskId: 'o::431' } }),
    );

    await expect(result).rejects.toBe(error);
    expect(writer.logs).toHaveLength(2);
    expect(writer.logs[1]).toMatchObject({
      level: 'error',
      message: 'rmq.error',
      trace: { correlationId: 'cid-error' },
      event: { name: 'goal.task.replace', outcome: 'failure' },
      error: {
        type: 'Error',
        message: 'Goal service failed',
        key: 'TASK_INFRASTRUCTURE_ERROR',
        code: 'GT-I-0000',
      },
    });
  });

  it('logs the converted timeout exception', async () => {
    const { client, contextStorage, writer } = createFixture(() => throwError(() => new TimeoutError()));

    const result = contextStorage.run(
      {
        trace: { correlationId: 'cid-timeout' },
        actor: { initiator: 'anonymous' },
        propagation: { userTimezone: 'UTC' },
      },
      () => client.send('auth.user.login', { data: { login: 'user@example.com' } }),
    );

    await expect(result).rejects.toMatchObject({
      key: 'RPC_TIMEOUT',
      code: 'S-GW-0001',
    });
    expect(writer.logs[1]).toMatchObject({
      message: 'rmq.error',
      actor: { initiator: 'anonymous' },
      error: {
        key: 'RPC_TIMEOUT',
        code: 'S-GW-0001',
      },
    });
  });

  it('requires an active observability context', async () => {
    const { client } = createFixture();

    await expect(client.send('goal.task.get', { data: { taskId: 'o::431' } })).rejects.toThrow(
      'Observability context is not available',
    );
  });
});
