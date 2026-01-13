import { DB } from '@/infrastructure/types';
import { Group } from '@/modules/tasks/domain/aggregates/group';
import { GroupsToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import {
  ExceptionGroupNotExist,
  ExceptionTaskAlreadyInGroup,
  ExceptionTaskNotInGroup,
} from '../exceptions';
import { GroupsReadRepository, GroupsWriteRepository } from '../ports';

@Injectable()
class GroupCheckerService {
  constructor(
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupReadRepo: GroupsReadRepository,
    @Inject(GroupsToken.WRITE_REPOSITORY) private readonly groupWriteRepo: GroupsWriteRepository,
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

    const { success, inboxId } = await this.groupReadRepo.ensureTaskInInboxGroup(
      {
        userId: input.userId,
        taskId: input.taskId,
      },
      trx,
    );

    if (!success && !skipException) {
      throw new ExceptionTaskNotInGroup({
        groupId: inboxId,
        taskId: input.taskId,
        message: 'Task is not in IN BOX',
      });
    }

    return success;
  }

  async ensureTaskNotInInboxGroup(
    input: { taskId: number; userId: number },
    params?: { trx?: Transaction<DB>; skipException?: false | undefined },
  ): Promise<{ inboxId: number; success: false }>;
  async ensureTaskNotInInboxGroup(
    input: { taskId: number; userId: number },
    params: { trx?: Transaction<DB>; skipException: true },
  ): Promise<{ inboxId: number; success: true }>;
  async ensureTaskNotInInboxGroup(
    input: { taskId: number; userId: number },
    params?: { trx?: Transaction<DB>; skipException?: boolean },
  ): Promise<{ inboxId: number; success: boolean }> {
    const { skipException, trx } = params ?? {};

    const { success, inboxId } = await this.groupReadRepo.ensureTaskInInboxGroup(
      {
        userId: input.userId,
        taskId: input.taskId,
      },
      trx,
    );

    if (success && !skipException) {
      throw new ExceptionTaskAlreadyInGroup({
        taskId: input.taskId,
        groupId: inboxId,
        message: 'Task is already in IN BOX',
      });
    }

    return { success, inboxId };
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

    const ensureResponse = await this.groupReadRepo.ensureTaskInGroup(
      {
        userId: input.userId,
        taskId: input.taskId,
        groupId: input.groupId,
      },
      trx,
    );

    if (ensureResponse && !skipException) {
      throw new ExceptionTaskAlreadyInGroup({
        groupId: input.groupId,
        taskId: input.taskId,
      });
    }

    return ensureResponse;
  }

  async ensureTaskInGroup(
    input: { taskId: number; userId: number; groupId: number },
    params?: { trx?: Transaction<DB>; skipException?: false | undefined },
  ): Promise<true>;
  async ensureTaskInGroup(
    input: { taskId: number; userId: number; groupId: number },
    params: { trx?: Transaction<DB>; skipException: true },
  ): Promise<boolean>;
  async ensureTaskInGroup(
    input: { taskId: number; userId: number; groupId: number },
    params?: { trx?: Transaction<DB>; skipException?: boolean },
  ): Promise<boolean> {
    const { skipException, trx } = params ?? {};

    const ensureResponse = await this.groupReadRepo.ensureTaskInGroup(
      {
        userId: input.userId,
        taskId: input.taskId,
        groupId: input.groupId,
      },
      trx,
    );

    if (!ensureResponse && !skipException) {
      throw new ExceptionTaskNotInGroup({
        groupId: input.groupId,
        taskId: input.taskId,
      });
    }

    return ensureResponse;
  }

  async ensureGroupExists(
    input: { groupId: number; userId: number },
    params?: { trx?: Transaction<DB>; skipException?: false | undefined },
  ): Promise<Group>;
  async ensureGroupExists(
    input: { groupId: number; userId: number },
    params: { trx?: Transaction<DB>; skipException: true },
  ): Promise<Group | null>;
  async ensureGroupExists(
    input: { groupId: number; userId: number },
    params?: { trx?: Transaction<DB>; skipException?: boolean },
  ): Promise<Group | null> {
    const { skipException, trx } = params ?? {};

    const group = await this.groupWriteRepo.getGroupById(
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
