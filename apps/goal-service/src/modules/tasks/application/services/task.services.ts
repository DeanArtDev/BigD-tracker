import { DB } from '@/infrastructure/types';
import { TasksRepository } from '@/modules/tasks/application/ports';
import { Task, TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tasks.tokens';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(@Inject(TasksToken.REPOSITORY) private readonly tasksRepo: TasksRepository) {}

  async createTask(input: CreateTaskInput, trx?: Transaction<DB>): Promise<Task> {
    const draftTask = new TaskFactory().create(input);
    const task = await this.tasksRepo.createTask(draftTask, trx);
    if (task === null) {
      throw new NotFoundException();
    }
    return task;
  }
}

export { TaskServices, CreateTaskInput };
