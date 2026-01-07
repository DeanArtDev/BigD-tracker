import { ExceptionTaskInfrastructure } from '@/modules/tasks/infrastructure/exceptions';

class BaseTasksRepository {
  constructor() {}

  async errorCatcher<T>(operation: string, callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error: unknown) {
      throw new ExceptionTaskInfrastructure({
        error,
        operation,
      });
    }
  }
}

export { BaseTasksRepository };
