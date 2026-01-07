import { DB } from '@/infrastructure/types';
import { GroupsToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { ExceptionTaskNotInGroup } from '../exceptions';
import { GroupsReadRepository } from '../ports';

@Injectable()
class GroupCheckerService {
  constructor(
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupReadRepo: GroupsReadRepository,
  ) {}

  async ensureTaskInInboxGroup(
    input: { taskId: number; userId: number },
    params?: { trx?: Transaction<DB>; skipException?: false | undefined },
  ): Promise<true>;
  async ensureTaskInInboxGroup(
    input: { taskId: number; userId: number },
    params: { trx?: Transaction<DB>; skipException: true },
  ): Promise<boolean>;
  async ensureTaskInInboxGroup(
    input: { taskId: number; userId: number },
    params?: { trx?: Transaction<DB>; skipException?: boolean },
  ): Promise<boolean> {
    const { skipException, trx } = params ?? {};

    const ensureResponse = await this.groupReadRepo.ensureTaskInInboxGroup(
      {
        userId: input.userId,
        taskId: input.taskId,
      },
      trx,
    );

    if (!ensureResponse.success && !skipException) {
      throw new ExceptionTaskNotInGroup({ taskId: input.taskId, message: 'Task is not in IN BOX' });
    }

    return ensureResponse.success;
  }
}

export { GroupCheckerService };
