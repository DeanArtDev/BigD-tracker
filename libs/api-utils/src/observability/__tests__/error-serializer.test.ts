import { BaseException } from '@big-d/exceptions';
import { describe, expect, it } from 'vitest';
import { serializeErrorForLog } from '../error-serializer';

describe('serializeErrorForLog', () => {
  it('uses wrapped error stack for base exceptions', () => {
    const sourceError = new Error('duplicate key value violates unique constraint');
    sourceError.stack = 'Error: duplicate key value violates unique constraint\n    at repo.ts:10:5';

    const exception = new BaseException({
      key: 'TASK_INFRASTRUCTURE_ERROR',
      code: 'GT-I-0000',
      details: {
        operation: 'createTask',
        error: sourceError,
      },
    });

    const serialized = serializeErrorForLog(exception);

    expect(serialized).toMatchObject({
      type: 'BaseException',
      message: 'duplicate key value violates unique constraint',
      stack: sourceError.stack,
      key: 'TASK_INFRASTRUCTURE_ERROR',
      code: 'GT-I-0000',
      details: {
        operation: 'createTask',
        error: {
          type: 'Error',
          message: 'duplicate key value violates unique constraint',
          stack: sourceError.stack,
        },
      },
      cause: {
        type: 'Error',
        message: 'duplicate key value violates unique constraint',
        stack: sourceError.stack,
      },
      wrapperMessage: 'TASK_INFRASTRUCTURE_ERROR',
    });
  });
});
