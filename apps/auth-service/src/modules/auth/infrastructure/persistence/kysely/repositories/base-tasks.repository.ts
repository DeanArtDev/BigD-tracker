import { ExceptionAuthInfrastructure } from '../../../exceptions';

class BaseTasksRepository {
  constructor() {}

  async errorCatcher<T>(operation: string, callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error: unknown) {
      throw new ExceptionAuthInfrastructure({
        error,
        operation,
      });
    }
  }
}

export { BaseTasksRepository };
