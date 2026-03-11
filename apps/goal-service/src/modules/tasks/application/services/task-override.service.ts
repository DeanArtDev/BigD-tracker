import { ExceptionOverrideNotExist } from '@/modules/tasks/application/exceptions';
import { TaskOverride } from '@/modules/tasks/domain';
import { TasksOverridesToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { compact } from 'lodash';
import { TasksOverridesRepositoryWritePort, TaskTransaction } from '../ports';
import {
  TaskOverrideByIds,
  TaskOverrideByRecurrencesIds,
  TaskOverrideByUserId,
  tasksCombinators,
} from '../specifications';

const { and } = tasksCombinators;

@Injectable()
class TaskOverrideService {
  constructor(
    @Inject(TasksOverridesToken.WRITE_REPOSITORY)
    private readonly tasksOverridesRepository: TasksOverridesRepositoryWritePort,
  ) {}

  async getOverride(input: { userId: number; id: number }, trx?: TaskTransaction): Promise<TaskOverride> {
    const override = await this.tasksOverridesRepository.getOneOverride(
      and(...compact([TaskOverrideByUserId(input.userId), TaskOverrideByIds([input.id])])),
      trx,
    );

    if (override == null) {
      throw new ExceptionOverrideNotExist({ overrideId: input.id });
    }

    return override;
  }

  async getOverridesByRecurrenceId(
    input: { userId: number; recurrenceId: number },
    trx?: TaskTransaction,
  ): Promise<TaskOverride[]> {
    return await this.tasksOverridesRepository.getManyOverrides(
      and(TaskOverrideByUserId(input.userId), TaskOverrideByRecurrencesIds([input.recurrenceId])),
      trx,
    );
  }

  async deleteOverridesByRecurrenceId(
    input: { userId: number; recurrenceId: number; ids: number[] },
    trx?: TaskTransaction,
  ): Promise<number> {
    return await this.tasksOverridesRepository.deleteManyOverride(
      and(
        ...compact([
          TaskOverrideByUserId(input.userId),
          TaskOverrideByRecurrencesIds([input.recurrenceId]),
          input.ids.length > 0 && TaskOverrideByIds(input.ids),
        ]),
      ),
      trx,
    );
  }

  async upsertOverride(input: TaskOverride, trx?: TaskTransaction): Promise<TaskOverride> {
    return await this.tasksOverridesRepository.upsertOverride(input, trx);
  }
}

export { TaskOverrideService };
