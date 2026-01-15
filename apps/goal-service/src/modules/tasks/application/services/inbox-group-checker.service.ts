import { DB } from '@/infrastructure/types';
import { GroupsToken } from '@/modules/tasks/tokens';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import {
  ExceptionInboxNotExist,
  ExceptionTaskAlreadyInGroup,
  ExceptionTaskNotInGroup,
} from '../exceptions';
import { GroupInboxReadRepository } from '../ports';

@Injectable()
class InboxGroupCheckerService {
  constructor(
    @Inject(GroupsToken.INBOX_READ_REPOSITORY)
    private readonly inboxReadRepo: GroupInboxReadRepository,
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

    const { success, inboxId } = await this.inboxReadRepo.ensureTaskInInbox(
      {
        userId: input.userId,
        taskId: input.taskId,
      },
      trx,
    );

    this.#inboxExistingValidation(inboxId);

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

    const { success, inboxId } = await this.inboxReadRepo.ensureTaskInInbox(
      {
        userId: input.userId,
        taskId: input.taskId,
      },
      trx,
    );

    this.#inboxExistingValidation(inboxId);

    if (success && !skipException) {
      throw new ExceptionTaskAlreadyInGroup({
        taskId: input.taskId,
        groupId: inboxId,
        message: 'Task is already in IN BOX',
      });
    }

    return { success, inboxId };
  }

  #inboxExistingValidation(inboxId: number) {
    if (Number.isNaN(inboxId)) {
      throw new ExceptionInboxNotExist({});
    }
  }
}

export { InboxGroupCheckerService };
