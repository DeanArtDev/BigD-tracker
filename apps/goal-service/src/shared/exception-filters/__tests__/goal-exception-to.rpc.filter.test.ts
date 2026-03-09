import { initTestEnvironment } from '@/../jest.setup';
import { ExceptionTaskNotFound } from '@/modules/tasks/application/exceptions';
import { ExceptionTaskInfrastructure } from '@/modules/tasks/infrastructure/exceptions';
import { BaseRpcException, RmqErrorKind } from '@big-d/api-contracts';
import { RequestContext } from '@big-d/api-utils';
import { exceptionCode } from '@big-d/exceptions';
import { GoalServiceRequestContext } from '@shared/request-context';
import { firstValueFrom } from 'rxjs';
import { GoalExceptionToRpc } from '../goal-exception-to.rpc.filter';

initTestEnvironment();

describe('GoalExceptionToRpc', () => {
  test('sanitizes infrastructure errors before returning them to the client', async () => {
    const filter = new GoalExceptionToRpc();
    const sourceError = new Error('duplicate key value violates unique constraint');
    sourceError.stack = 'Error: duplicate key value violates unique constraint\n    at repo.ts:10:5';

    const error = await GoalServiceRequestContext.run(
      new RequestContext({
        correlationId: 'cid-123',
        source: 'rmq',
      }),
      async (): Promise<BaseRpcException> => {
        try {
          await firstValueFrom(
            filter.catch(
              new ExceptionTaskInfrastructure({
                operation: 'createTask',
                error: sourceError,
              }),
            ),
          );
          throw new Error('Expected filter to throw');
        } catch (exception) {
          return exception as BaseRpcException;
        }
      },
    );

    expect(error).toMatchObject({
      key: 'TASK_INFRASTRUCTURE_ERROR',
      code: exceptionCode.taskDBFailed.code,
      kind: RmqErrorKind.INTERNAL,
      details: {
        correlationId: 'cid-123',
        message: 'Task infrastructure error',
        operation: 'createTask',
      },
    });

    expect(error.details).not.toHaveProperty('error');
    expect(error.details).not.toHaveProperty('stack');
    expect(JSON.stringify(error.details)).not.toContain('duplicate key value violates unique constraint');
  });

  test('adds correlationId to regular rpc errors too', async () => {
    const filter = new GoalExceptionToRpc();

    const error = await GoalServiceRequestContext.run(
      new RequestContext({
        correlationId: 'cid-regular',
        source: 'rmq',
      }),
      async (): Promise<BaseRpcException> => {
        try {
          await firstValueFrom(
            filter.catch(
              new ExceptionTaskNotFound({
                taskId: 42,
              }),
            ),
          );
          throw new Error('Expected filter to throw');
        } catch (exception) {
          return exception as BaseRpcException;
        }
      },
    );

    expect(error).toMatchObject({
      code: exceptionCode.taskNotFound.code,
      kind: RmqErrorKind.NOT_FOUND,
      details: {
        correlationId: 'cid-regular',
        taskId: 42,
      },
    });
    expect(error.details).toHaveProperty('timestamp');
  });
});
