import { ExceptionTaskUnprocessable } from '@/modules/tasks/application/exceptions';
import { TaskRecurrence } from '@/modules/tasks/domain';
import { TasksOverridesToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { compact } from 'lodash';
import { TasksOverridesRepositoryWritePort, TaskTransaction } from '../ports';
import {
  TaskRecurrenceById,
  TaskRecurrenceByTaskId,
  TaskRecurrenceByUserId,
  tasksCombinators,
} from '../specifications';

const { and } = tasksCombinators;

@Injectable()
class TaskRecurrenceService {
  constructor(
    @Inject(TasksOverridesToken.WRITE_REPOSITORY)
    private readonly tasksOverridesRepository: TasksOverridesRepositoryWritePort,
  ) {}

  async getRecurrence(
    input: { userId: number; id?: number; taskId?: number },
    trx?: TaskTransaction,
  ): Promise<TaskRecurrence | null> {
    return await this.tasksOverridesRepository.getOneRecurrence(
      and(
        ...compact([
          TaskRecurrenceByUserId(input.userId),
          input.id != null && TaskRecurrenceById(input.id),
          input.taskId != null && TaskRecurrenceByTaskId(input.taskId),
        ]),
      ),
      trx,
    );
  }

  async updateRecurrence(recurrence: TaskRecurrence, trx?: TaskTransaction): Promise<TaskRecurrence> {
    return await this.tasksOverridesRepository.updateRecurrence(recurrence, trx);
  }

  async upsertRecurrence(recurrence: TaskRecurrence, trx?: TaskTransaction): Promise<TaskRecurrence> {
    return await this.tasksOverridesRepository.upsertRecurrence(recurrence, trx);
  }

  async deleteRecurrence(input: { id: number }, trx?: TaskTransaction): Promise<void> {
    const isDelete = await this.tasksOverridesRepository.deleteRecurrence(input, trx);
    if (!isDelete) {
      throw new ExceptionTaskUnprocessable({
        taskId: input.id,
        message: 'Не удалось удалить рекурренс',
      });
    }
  }
}

export { TaskRecurrenceService };
