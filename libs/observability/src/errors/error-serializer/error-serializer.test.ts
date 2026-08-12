import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ErrorLog } from '../../contracts';
import type { ErrorProjection } from '../error-projection';
import { DEFAULT_MAX_ERROR_DEPTH, serializeError } from '.';

describe('serializeError', () => {
  it('serializes native errors and their cause chain', () => {
    const cause = new TypeError('Invalid task identifier');
    const error = new Error('Task update failed', { cause });

    const result = serializeError(error);

    expect(result).toMatchObject({
      type: 'Error',
      message: 'Task update failed',
      cause: {
        type: 'TypeError',
        message: 'Invalid task identifier',
      },
    });
    expect(result.stack).toContain('Task update failed');
  });

  it('structurally serializes application errors without importing their classes', () => {
    const postgresError = Object.assign(new Error('duplicate key value violates unique constraint'), {
      type: 'PostgresError',
      code: '23505',
      constraint: 'tasks_recurrences_override_r_id_r_start_unique',
      schema: 'public',
      table: 'tasks_recurrences_overrides',
      severity: 'ERROR',
    });
    const applicationError = {
      name: 'ExceptionTaskInfrastructure',
      message: 'Task infrastructure error',
      key: 'TASK_INFRASTRUCTURE_ERROR',
      code: 'GT-I-0000',
      details: {
        operation: 'tasks.upsert-override',
        error: postgresError,
        context: 'replace-task',
      },
    };

    const result = serializeError(applicationError);

    expect(result).toEqual({
      type: 'ExceptionTaskInfrastructure',
      message: 'Task infrastructure error',
      key: 'TASK_INFRASTRUCTURE_ERROR',
      code: 'GT-I-0000',
      operation: 'tasks.upsert-override',
      details: {
        operation: 'tasks.upsert-override',
        context: 'replace-task',
      },
      cause: expect.objectContaining({
        type: 'PostgresError',
        message: 'duplicate key value violates unique constraint',
        code: '23505',
        constraint: 'tasks_recurrences_override_r_id_r_start_unique',
        severity: 'ERROR',
        schema: 'public',
        table: 'tasks_recurrences_overrides',
      }),
    });
  });

  it('accepts the library projection contract', () => {
    const projection = {
      type: 'ProjectedException',
      message: 'Projected failure',
      code: 'PROJECTED_ERROR',
      retryable: true,
      details: { resource: 'task' },
      cause: 'Low-level failure',
    } satisfies ErrorProjection;

    const result = serializeError(projection);

    expectTypeOf(result).toEqualTypeOf<ErrorLog>();
    expect(result).toEqual({
      type: 'ProjectedException',
      message: 'Projected failure',
      code: 'PROJECTED_ERROR',
      retryable: true,
      details: { resource: 'task' },
      cause: {
        type: 'Error',
        message: 'Low-level failure',
      },
    });
  });

  it.each([
    [null, { type: 'UnknownError', message: 'Unknown error' }],
    [undefined, { type: 'UnknownError', message: 'Unknown error' }],
    ['failure', { type: 'Error', message: 'failure' }],
    [42, { type: 'Number', message: '42' }],
    [true, { type: 'Boolean', message: 'true' }],
    [10n, { type: 'BigInt', message: '10' }],
  ])('provides a safe fallback for %p', (input, expected) => {
    expect(serializeError(input)).toEqual(expected);
  });

  it('protects the cause chain from circular references', () => {
    const error: { type: string; message: string; cause?: unknown } = {
      type: 'CyclicError',
      message: 'Cyclic failure',
    };
    error.cause = error;

    expect(serializeError(error)).toEqual({
      type: 'CyclicError',
      message: 'Cyclic failure',
      cause: {
        type: 'CircularErrorReference',
        message: '[Circular error reference]',
      },
    });
  });

  it('converts circular and non-JSON detail values into serializable values', () => {
    const details: Record<string, unknown> = {
      createdAt: new Date('2026-08-12T03:30:15.421Z'),
      sequence: 10n,
      callback: function retryTask() {},
    };
    details.self = details;

    const result = serializeError({
      type: 'DetailedError',
      message: 'Detailed failure',
      details,
    });

    expect(result.details).toEqual({
      createdAt: '2026-08-12T03:30:15.421Z',
      sequence: '10',
      callback: '[Function retryTask]',
      self: expect.objectContaining({ self: '[Circular]' }),
    });
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it('removes correlationId recursively from serialized error details', () => {
    const error = {
      type: 'GraphQLError',
      message: 'Task infrastructure error',
      details: {
        correlationId: 'cid-123',
        extensions: {
          correlationId: 'cid-123',
          code: 'GT-I-0000',
        },
        nested: [{ correlationId: 'cid-123', operation: 'tasks.get-inbox' }],
        error: {
          type: 'RpcError',
          message: 'Task infrastructure error',
          details: {
            correlationId: 'cid-123',
            kind: 'INTERNAL',
          },
        },
      },
    };

    const result = serializeError(error);

    expect(result).toMatchObject({
      details: {
        extensions: { code: 'GT-I-0000' },
        nested: [{ operation: 'tasks.get-inbox' }],
      },
      cause: {
        type: 'RpcError',
        details: { kind: 'INTERNAL' },
      },
    });
    expect(JSON.stringify(result)).not.toContain('correlationId');
  });

  it('limits the cause depth', () => {
    const error = {
      type: 'FirstError',
      message: 'First',
      cause: {
        type: 'SecondError',
        message: 'Second',
        cause: {
          type: 'ThirdError',
          message: 'Third',
        },
      },
    };

    expect(serializeError(error, { maxDepth: 2 })).toEqual({
      type: 'FirstError',
      message: 'First',
      cause: {
        type: 'SecondError',
        message: 'Second',
      },
    });
    expect(DEFAULT_MAX_ERROR_DEPTH).toBe(8);
  });

  it.each([0, -1, 1.5, Number.NaN])('rejects invalid maxDepth %p', (maxDepth) => {
    expect(() => serializeError(new Error('failure'), { maxDepth })).toThrow(RangeError);
  });
});
