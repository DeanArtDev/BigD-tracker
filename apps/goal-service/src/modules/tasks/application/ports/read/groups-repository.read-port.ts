import { GroupView, GroupWithTasksView } from '@/modules/tasks/application/dto';
import { TaskTransaction } from '../transaction-manager.port';

interface GetGroupByIdInput {
  readonly groupId: number;
  readonly userId: number;
}

interface ThrowErrorOptions {
  readonly throwError?: boolean;
  readonly trx?: TaskTransaction;
}

interface GroupsReadRepository {
  getByName(
    input: { name: string; userId: number },
    trx?: TaskTransaction,
  ): Promise<GroupView | null>;

  getGroupById(
    input: GetGroupByIdInput,
    options?: { throwError?: false; trx?: TaskTransaction },
  ): Promise<GroupView | null>;
  getGroupById(
    input: GetGroupByIdInput,
    options: { throwError: true; trx?: TaskTransaction },
  ): Promise<GroupView>;
  getGroupById(input: GetGroupByIdInput, options?: ThrowErrorOptions): Promise<GroupView | null>;

  getGroupWithTasksById(
    input: GetGroupByIdInput,
    options?: { throwError?: false; trx?: TaskTransaction },
  ): Promise<GroupWithTasksView | null>;
  getGroupWithTasksById(
    input: GetGroupByIdInput,
    options: { throwError: true; trx?: TaskTransaction },
  ): Promise<GroupWithTasksView>;
  getGroupWithTasksById(
    input: GetGroupByIdInput,
    options?: ThrowErrorOptions,
  ): Promise<GroupWithTasksView | null>;

  ensureTaskInGroup(
    input: { userId: number; taskId: number; groupId: number },
    trx?: TaskTransaction,
  ): Promise<boolean>;

  getGroupListWithTasksByUserId(
    input: { userId: number },
    trx?: TaskTransaction,
  ): Promise<GroupWithTasksView[]>;
}

export { GroupsReadRepository, GetGroupByIdInput, ThrowErrorOptions };
