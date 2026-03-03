import { GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { GroupsToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { ExceptionGroupNotExist, ExceptionTaskAlreadyInGroup, ExceptionTaskNotInGroup } from '../exceptions';
import { GroupsReadRepository, GroupsWriteRepository, TaskTransaction } from '../ports';

@Injectable()
class GroupCheckerService {
  constructor(
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupReadRepo: GroupsReadRepository,
    @Inject(GroupsToken.WRITE_REPOSITORY) private readonly groupWriteRepo: GroupsWriteRepository,
  ) {}

  async ensureTaskNotInGroup(
    input: { taskId: number; userId: number; groupId: number },
    params?: { trx?: TaskTransaction; skipException?: false | undefined },
  ): Promise<true>;
  async ensureTaskNotInGroup(
    input: { taskId: number; userId: number; groupId: number },
    params: { trx?: TaskTransaction; skipException: true },
  ): Promise<boolean>;
  async ensureTaskNotInGroup(
    input: { taskId: number; userId: number; groupId: number },
    params?: { trx?: TaskTransaction; skipException?: boolean },
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
    params?: { trx?: TaskTransaction; skipException?: false | undefined },
  ): Promise<true>;
  async ensureTaskInGroup(
    input: { taskId: number; userId: number; groupId: number },
    params: { trx?: TaskTransaction; skipException: true },
  ): Promise<boolean>;
  async ensureTaskInGroup(
    input: { taskId: number; userId: number; groupId: number },
    params?: { trx?: TaskTransaction; skipException?: boolean },
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
    params?: { trx?: TaskTransaction; skipException?: false | undefined; includeInbox?: boolean },
  ): Promise<GroupWithTasks>;
  async ensureGroupExists(
    input: { groupId: number; userId: number },
    params: { trx?: TaskTransaction; skipException: true; includeInbox?: boolean },
  ): Promise<GroupWithTasks | null>;
  async ensureGroupExists(
    input: { groupId: number; userId: number },
    params?: { trx?: TaskTransaction; skipException?: boolean; includeInbox?: boolean },
  ): Promise<GroupWithTasks | null> {
    const { skipException, trx } = params ?? {};

    const group = await this.groupWriteRepo.getGroupById(
      { groupId: input.groupId, userId: input.userId, includeInbox: params?.includeInbox },
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
