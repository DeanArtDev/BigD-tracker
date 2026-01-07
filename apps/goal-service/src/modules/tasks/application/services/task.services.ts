import { DB } from '@/infrastructure/types';
import { ExceptionTaskNotExist } from '@/modules/tasks/application/exceptions';
import { TasksWriteRepository } from '@/modules/tasks/application/ports';
import { Task, TaskFactory } from '@/modules/tasks/domain';
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

interface ReplaceTaskInput {
  readonly id: number;
  readonly name: string;
  readonly userId: number;
  readonly description?: string;
  readonly priority: number;
  readonly weight: number;
  readonly startDate?: string;
  readonly deadline?: string;
  readonly recurrence?: string;
}

@Injectable()
class TaskServices {
  constructor(
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async createTask(input: CreateTaskInput, trx?: Transaction<DB>): Promise<Task> {
    const draftTask = TaskFactory.create(input);
    return await this.tasksWriteRepo.createTask(draftTask, trx);
  }

  async replaceTask(input: ReplaceTaskInput, trx?: Transaction<DB>): Promise<Task> {
    const task = await this.tasksWriteRepo.getTaskById({ id: input.id, userId: input.userId });
    if (task == null) {
      throw new ExceptionTaskNotExist({ taskId: input.id });
    }

    const replacedTask = TaskFactory.update(task, input);

    return await this.tasksWriteRepo.replaceTask(replacedTask, trx);
  }
}

export { TaskServices, CreateTaskInput, ReplaceTaskInput };
