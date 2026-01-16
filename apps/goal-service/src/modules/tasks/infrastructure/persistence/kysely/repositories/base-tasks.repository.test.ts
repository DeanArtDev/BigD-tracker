import { ExceptionTaskInfrastructure } from '@/modules/tasks/infrastructure/exceptions';
import { BaseTasksRepository } from './base-tasks.repository';

describe('BaseTasksRepository', () => {
  it('returns the callback result', async () => {
    const repository = new BaseTasksRepository();

    await expect(repository.errorCatcher('noop', async () => 42)).resolves.toBe(42);
  });

  it('wraps errors with ExceptionTaskInfrastructure', async () => {
    const repository = new BaseTasksRepository();

    await expect(
      repository.errorCatcher('tasks.test', async () => {
        throw new Error('boom');
      }),
    ).rejects.toBeInstanceOf(ExceptionTaskInfrastructure);
  });
});
