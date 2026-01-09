import { DB } from '@/infrastructure/types';
import { TasksWriteRepository } from '@/modules/tasks/application/ports';
import { Task, TaskFactory } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { TaskCheckerService } from './task-checker.service';

interface DeleteTaskInput {
  readonly taskId: number;
  readonly userId: number;
}

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
class TaskService {
  constructor(
    private readonly taskCheckerService: TaskCheckerService,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async createTask(input: CreateTaskInput, trx?: Transaction<DB>): Promise<Task> {
    const draftTask = TaskFactory.create(input);
    return await this.tasksWriteRepo.createTask(draftTask, trx);
  }

  async cloneTask(input: { taskId: number; userId: number }, trx?: Transaction<DB>): Promise<Task> {
    const { taskId, userId } = input;

    const task = await this.taskCheckerService.ensureTaskExists({ taskId, userId }, { trx });
    const clonedTask = TaskFactory.clone(task);

    return await this.tasksWriteRepo.createTask(clonedTask, trx);
  }

  async softDeleteTask(input: DeleteTaskInput, trx?: Transaction<DB>): Promise<{ id: number }> {
    const task = await this.taskCheckerService.ensureTaskExists(
      { taskId: input.taskId, userId: input.userId },
      { trx },
    );
    const draftTask = TaskFactory.deleteSoft(task);
    await this.tasksWriteRepo.changeTaskStatus(draftTask, trx);
    return { id: draftTask.id };
  }

  async replaceTask(input: ReplaceTaskInput, trx?: Transaction<DB>): Promise<Task> {
    const task = await this.taskCheckerService.ensureTaskExists(
      { taskId: input.id, userId: input.userId },
      { trx },
    );

    const replacedTask = TaskFactory.update(task, input);

    return await this.tasksWriteRepo.replaceTask(replacedTask, trx);
  }
}

export { TaskService, CreateTaskInput, ReplaceTaskInput, DeleteTaskInput };
