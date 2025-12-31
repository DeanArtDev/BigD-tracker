import { BaseException, exceptionCode } from '@big-d/exceptions';

class BaseTasksRepository {
  constructor() {}

  async errorCatcher<T>(operation: string, callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error: unknown) {
      throw new BaseException({
        code: exceptionCode.taskDBFailed.code,
        key: 'TASK_INFRASTRUCTURE_ERROR',
        details: { operation, error },
      });
    }
  }
}

export { BaseTasksRepository };
