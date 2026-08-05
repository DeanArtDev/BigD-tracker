import { initTestEnvironment } from '@/../jest.setup';
import {
  ExceptionGroupSettingsNotFound,
  ExceptionGroupWriteConflict,
  ExceptionTaskNotFound,
  ExceptionTaskRecurrenceOverrideSettingsNotFound,
  ExceptionTaskSettingsNotFound,
} from '@/modules/tasks/application/exceptions';
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

  test('maps missing group settings to not found', async () => {
    const filter = new GoalExceptionToRpc();

    const error = await GoalServiceRequestContext.run(
      new RequestContext({ correlationId: 'cid-settings', source: 'rmq' }),
      async (): Promise<BaseRpcException> => {
        try {
          await firstValueFrom(filter.catch(new ExceptionGroupSettingsNotFound({ groupId: 42 })));
          throw new Error('Expected filter to throw');
        } catch (exception) {
          return exception as BaseRpcException;
        }
      },
    );

    expect(error).toMatchObject({
      key: 'GROUP_SETTINGS_NOT_FOUND',
      code: exceptionCode.groupSettingsNotFound.code,
      kind: RmqErrorKind.NOT_FOUND,
      details: {
        correlationId: 'cid-settings',
        groupId: 42,
      },
    });
  });

  test('maps missing task settings to not found', async () => {
    const filter = new GoalExceptionToRpc();

    const error = await GoalServiceRequestContext.run(
      new RequestContext({ correlationId: 'cid-task-settings', source: 'rmq' }),
      async (): Promise<BaseRpcException> => {
        try {
          await firstValueFrom(filter.catch(new ExceptionTaskSettingsNotFound({ taskId: 'o::42' })));
          throw new Error('Expected filter to throw');
        } catch (exception) {
          return exception as BaseRpcException;
        }
      },
    );

    expect(error).toMatchObject({
      key: 'TASK_SETTINGS_NOT_FOUND',
      code: exceptionCode.taskSettingsNotFound.code,
      kind: RmqErrorKind.NOT_FOUND,
      details: {
        correlationId: 'cid-task-settings',
        taskId: 'o::42',
      },
    });
  });

  test('maps missing task recurrence override settings to not found', async () => {
    const filter = new GoalExceptionToRpc();
    const taskId = 'ov::7::2026-08-05T10:00:00.000Z::15';

    const error = await GoalServiceRequestContext.run(
      new RequestContext({ correlationId: 'cid-override-settings', source: 'rmq' }),
      async (): Promise<BaseRpcException> => {
        try {
          await firstValueFrom(filter.catch(new ExceptionTaskRecurrenceOverrideSettingsNotFound({ taskId })));
          throw new Error('Expected filter to throw');
        } catch (exception) {
          return exception as BaseRpcException;
        }
      },
    );

    expect(error).toMatchObject({
      key: 'TASK_RECURRENCE_OVERRIDE_SETTINGS_NOT_FOUND',
      code: exceptionCode.taskRecurrenceOverrideSettingsNotFound.code,
      kind: RmqErrorKind.NOT_FOUND,
      details: {
        correlationId: 'cid-override-settings',
        taskId,
      },
    });
  });

  test('maps group write conflict to conflict', async () => {
    const filter = new GoalExceptionToRpc();

    const error = await GoalServiceRequestContext.run(
      new RequestContext({ correlationId: 'cid-write-conflict', source: 'rmq' }),
      async (): Promise<BaseRpcException> => {
        try {
          await firstValueFrom(
            filter.catch(
              new ExceptionGroupWriteConflict({
                subjectId: 42,
                message: 'Group settings could not be updated',
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
      key: 'GROUP_WRITE_CONFLICT',
      code: exceptionCode.writeConflict.code,
      kind: RmqErrorKind.CONFLICT,
      details: {
        correlationId: 'cid-write-conflict',
        subjectId: 42,
        message: 'Group settings could not be updated',
      },
    });
  });
});
