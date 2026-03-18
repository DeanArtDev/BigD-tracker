import { describe, expect, it } from 'vitest';
import { pino } from 'pino';
import { SENSITIVE_LOG_PATHS } from '../redact-paths';

function createMemoryStream() {
  const chunks: string[] = [];

  return {
    chunks,
    stream: {
      write(chunk: string) {
        chunks.push(chunk);
      },
    },
  };
}

describe('SENSITIVE_LOG_PATHS', () => {
  it('redacts login and password fields with censor mode', () => {
    const { chunks, stream } = createMemoryStream();
    const logger = pino(
      {
        redact: {
          paths: [...SENSITIVE_LOG_PATHS],
          censor: '[REDACTED]',
        },
      },
      stream,
    );

    logger.info({
      login: 'admin',
      password: 'secret',
      data: {
        login: 'service-user',
        password: 'service-password',
      },
      req: {
        body: {
          login: 'body-user',
          password: 'body-password',
          data: {
            login: 'nested-body-user',
            password: 'nested-body-password',
          },
        },
      },
    });

    const payload = JSON.parse(chunks[0] ?? '{}');

    expect(payload.login).toBe('[REDACTED]');
    expect(payload.password).toBe('[REDACTED]');
    expect(payload.data.login).toBe('[REDACTED]');
    expect(payload.data.password).toBe('[REDACTED]');
    expect(payload.req.body.login).toBe('[REDACTED]');
    expect(payload.req.body.password).toBe('[REDACTED]');
    expect(payload.req.body.data.login).toBe('[REDACTED]');
    expect(payload.req.body.data.password).toBe('[REDACTED]');
  });

  it('removes login and password fields with remove mode', () => {
    const { chunks, stream } = createMemoryStream();
    const logger = pino(
      {
        redact: {
          paths: [...SENSITIVE_LOG_PATHS],
          remove: true,
        },
      },
      stream,
    );

    logger.info({
      login: 'admin',
      password: 'secret',
      data: {
        login: 'service-user',
        password: 'service-password',
      },
      req: {
        body: {
          login: 'body-user',
          password: 'body-password',
        },
      },
    });

    const payload = JSON.parse(chunks[0] ?? '{}');

    expect(payload.login).toBeUndefined();
    expect(payload.password).toBeUndefined();
    expect(payload.data.login).toBeUndefined();
    expect(payload.data.password).toBeUndefined();
    expect(payload.req.body.login).toBeUndefined();
    expect(payload.req.body.password).toBeUndefined();
  });
});
