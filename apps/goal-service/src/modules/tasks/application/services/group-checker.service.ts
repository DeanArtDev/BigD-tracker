import { DB } from '@/infrastructure/types';
import { GroupView } from '@/modules/tasks/application/dto/group.view';
import { GroupsToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import {
  ExceptionGroupNotExist,
  ExceptionTaskAlreadyInGroup,
  ExceptionTaskNotInGroup,
} from '../exceptions';
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

  async ensureTaskNotInGroup(
    input: { taskId: number; userId: number; groupId: number },
    params?: { trx?: Transaction<DB>; skipException?: false | undefined },
  ): Promise<true>;
  async ensureTaskNotInGroup(
    input: { taskId: number; userId: number; groupId: number },
    params: { trx?: Transaction<DB>; skipException: true },
  ): Promise<boolean>;
  async ensureTaskNotInGroup(
    input: { taskId: number; userId: number; groupId: number },
    params?: { trx?: Transaction<DB>; skipException?: boolean },
  ): Promise<boolean> {
    const { skipException, trx } = params ?? {};

    const ensureResponse = await this.groupReadRepo.ensureTaskNotInGroup(
      {
        userId: input.userId,
        taskId: input.taskId,
        groupId: input.groupId,
      },
      trx,
    );

    if (!ensureResponse && !skipException) {
      throw new ExceptionTaskAlreadyInGroup({
        groupId: input.groupId,
        taskId: input.taskId,
      });
    }

    return ensureResponse;
  }

  async ensureGroupExists(
    input: { groupId: number; userId: number },
    params?: { trx?: Transaction<DB>; skipException?: false | undefined },
  ): Promise<GroupView>;
  async ensureGroupExists(
    input: { groupId: number; userId: number },
    params: { trx?: Transaction<DB>; skipException: true },
  ): Promise<GroupView | null>;
  async ensureGroupExists(
    input: { groupId: number; userId: number },
    params?: { trx?: Transaction<DB>; skipException?: boolean },
  ): Promise<GroupView | null> {
    const { skipException, trx } = params ?? {};

    const group = await this.groupReadRepo.getGroupById(
      { groupId: input.groupId, userId: input.userId },
      trx,
    );

    if (skipException != null) {
      return group;
    }

    if (group == null) {
      throw new ExceptionGroupNotExist({ groupId: input.groupId });
    }

    return group;
  }
}

export { GroupCheckerService };
