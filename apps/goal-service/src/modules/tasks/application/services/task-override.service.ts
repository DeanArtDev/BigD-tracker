import { ExceptionOverrideNotExist } from '@/modules/tasks/application/exceptions';
import { TaskOverride } from '@/modules/tasks/domain';
import { TasksOverridesToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { compact } from 'lodash';
import { TasksOverridesRepositoryWritePort, TaskTransaction } from '../ports';
import { TaskOverrideById, TaskOverrideByUserId, tasksCombinators } from '../specifications';

const { and } = tasksCombinators;

@Injectable()
class TaskOverrideService {
  constructor(
    @Inject(TasksOverridesToken.WRITE_REPOSITORY)
    private readonly tasksOverridesRepository: TasksOverridesRepositoryWritePort,
  ) {}

  async getOverride(input: { userId: number; id: number }, trx?: TaskTransaction): Promise<TaskOverride> {
    const override = await this.tasksOverridesRepository.getOneOverride(
      and(...compact([TaskOverrideByUserId(input.userId), TaskOverrideById(input.id)])),
      trx,
    );

    if (override == null) {
      throw new ExceptionOverrideNotExist({ overrideId: input.id });
    }

    return override;
  }

  async upsertOverride(input: TaskOverride, trx?: TaskTransaction): Promise<TaskOverride> {
    return await this.tasksOverridesRepository.upsertOverride(input, trx);
  }
}

export { TaskOverrideService };
