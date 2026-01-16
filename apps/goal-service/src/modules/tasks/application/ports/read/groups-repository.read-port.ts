import { DB } from '@/infrastructure/types';
import { GroupView, GroupWithTasksView } from '@/modules/tasks/application/dto';
import { Transaction } from 'kysely';

interface GetGroupByIdInput {
  readonly groupId: number;
  readonly userId: number;
}

interface ThrowErrorOptions {
  readonly throwError?: boolean;
  readonly trx?: Transaction<DB>;
}

interface GroupsReadRepository {
  getByName(
    input: { name: string; userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupView | null>;

  getGroupById(
    input: GetGroupByIdInput,
    options?: { throwError?: false; trx?: Transaction<DB> },
  ): Promise<GroupView | null>;
  getGroupById(
    input: GetGroupByIdInput,
    options: { throwError: true; trx?: Transaction<DB> },
  ): Promise<GroupView>;
  getGroupById(input: GetGroupByIdInput, options?: ThrowErrorOptions): Promise<GroupView | null>;

  getGroupWithTasksById(
    input: GetGroupByIdInput,
    options?: { throwError?: false; trx?: Transaction<DB> },
  ): Promise<GroupWithTasksView | null>;
  getGroupWithTasksById(
    input: GetGroupByIdInput,
    options: { throwError: true; trx?: Transaction<DB> },
  ): Promise<GroupWithTasksView>;
  getGroupWithTasksById(
    input: GetGroupByIdInput,
    options?: ThrowErrorOptions,
  ): Promise<GroupWithTasksView | null>;

  ensureTaskInGroup(
    input: { userId: number; taskId: number; groupId: number },
    trx?: Transaction<DB>,
  ): Promise<boolean>;

  getGroupListWithTasksByUserId(
    input: { userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupWithTasksView[]>;
}

export { GroupsReadRepository, GetGroupByIdInput, ThrowErrorOptions };
