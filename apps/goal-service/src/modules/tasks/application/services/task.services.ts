import { DB } from '@/infrastructure/types';
import { TasksWriteRepository } from '@/modules/tasks/application/ports';
import { TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

interface CreateTaskInput {
  readonly userId: number;
  readonly name: string;
  readonly groupId?: number;
  readonly description?: string;
  readonly priority?: number;
  readonly weight?: number;
  readonly startDate?: string;
  readonly deadline?: string;
  readonly recurrence?: string;
}

@Injectable()
class TaskServices {
  constructor(
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async createTask(input: CreateTaskInput, trx?: Transaction<DB>): Promise<{ id: number }> {
    const draftTask = TaskFactory.create(input);
    return await this.tasksWriteRepo.createTask(draftTask, trx);
  }
}

export { TaskServices, CreateTaskInput };
