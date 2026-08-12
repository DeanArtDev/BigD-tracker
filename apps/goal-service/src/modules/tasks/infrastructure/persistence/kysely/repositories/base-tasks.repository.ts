import { ExceptionTaskInfrastructure } from '@/modules/tasks/infrastructure/exceptions';
import { projectPostgresqlError } from '@big-d/observability';

class BaseTasksRepository {
  constructor() {}

  async errorCatcher<T>(operation: string, callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error: unknown) {
      throw new ExceptionTaskInfrastructure({
        error: projectPostgresqlError(error),
        operation,
      });
    }
  }
}

export { BaseTasksRepository };
