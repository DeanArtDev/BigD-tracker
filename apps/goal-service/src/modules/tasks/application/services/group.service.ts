import { DB } from '@/infrastructure/types';
import { GroupsReadRepository, TasksReadRepository } from '@/modules/tasks/application/ports';
import { GroupsToken, TasksToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

@Injectable()
class GroupsService {
  constructor(
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupReadRepo: GroupsReadRepository,
    @Inject(TasksToken.READ_REPOSITORY) private readonly tasksReadRepo: TasksReadRepository,
  ) {}

  // кажется надо переписать!
  async canAddTaskToGroup(
    input: { taskId: number; groupId?: number },
    trx?: Transaction<DB>,
  ): Promise<boolean> {
    if (input.groupId == null) return false;
    const isExists = await this.groupReadRepo.isGroupExists({ groupId: input.groupId }, trx);
    if (!isExists) return false;
    return await this.tasksReadRepo.isTaskIntoGroup(
      { taskId: input.taskId, groupId: input.groupId },
      trx,
    );
  }
}

export { GroupsService };
