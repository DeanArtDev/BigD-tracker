import { ExceptionAuthInfrastructure } from '../../../exceptions';
import { projectPostgresqlError } from '@big-d/observability';

class BaseAuthRepository {
  async errorCatcher<T>(operation: string, callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error: unknown) {
      throw new ExceptionAuthInfrastructure({
        error: projectPostgresqlError(error),
        operation,
      });
    }
  }
}

export { BaseAuthRepository };
