import { Task, TaskRecurrence } from '@/modules/tasks/domain';
import { TasksToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { ExceptionRecurrenceNotExist, ExceptionTaskNotExist } from '../exceptions';
import { TasksWriteRepository, TaskTransaction } from '../ports';
import { TaskRecurrenceService } from './task-recurrence.service';

@Injectable()
class TaskCheckerService {
  constructor(
    private readonly taskRecurrenceService: TaskRecurrenceService,
    @Inject(TasksToken.WRITE_REPOSITORY) private readonly tasksWriteRepo: TasksWriteRepository,
  ) {}

  async ensureTaskExists(
    input: { taskId: number; userId: number },
    params?: { trx?: TaskTransaction; skipException?: false | undefined },
  ): Promise<Task>;
  async ensureTaskExists(
    input: { taskId: number; userId: number },
    params: { trx?: TaskTransaction; skipException: true },
  ): Promise<Task | null>;
  async ensureTaskExists(
    input: { taskId: number; userId: number },
    params?: { trx?: TaskTransaction; skipException?: boolean },
  ): Promise<Task | null> {
    const { skipException, trx } = params ?? {};

    const task = await this.tasksWriteRepo.getTaskById({ taskId: input.taskId, userId: input.userId }, trx);

    if (skipException != null) {
      return task;
    }

    if (task == null) {
      throw new ExceptionTaskNotExist({ taskId: input.taskId });
    }

    return task;
  }

  async ensureRecurrenceExists(
    input: { id: number; userId: number },
    params?: { trx?: TaskTransaction; skipException?: false | undefined },
  ): Promise<TaskRecurrence>;
  async ensureRecurrenceExists(
    input: { id: number; userId: number },
    params: { trx?: TaskTransaction; skipException: true },
  ): Promise<TaskRecurrence | null>;
  async ensureRecurrenceExists(
    input: { id: number; userId: number },
    params?: { trx?: TaskTransaction; skipException?: boolean },
  ): Promise<TaskRecurrence | null> {
    const { skipException, trx } = params ?? {};

    const recurrence = await this.taskRecurrenceService.getRecurrence(input, trx);

    if (skipException != null) {
      return recurrence;
    }

    if (recurrence == null) {
      throw new ExceptionRecurrenceNotExist({ recurrenceId: input.id });
    }

    return recurrence;
  }
}

export { TaskCheckerService };
