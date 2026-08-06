import { SortDirection } from '@big-d/api-contracts';
import { GroupInfoView, GroupSettingsView, GroupView } from '../../dto';
import { TasksSpecification } from '../../specifications';
import { TaskTransaction } from '../transaction-manager.port';

interface GroupsReadRepository {
  getByName(input: { name: string; userId: number }, trx?: TaskTransaction): Promise<GroupView | null>;

  getDiaryGroups(input: { readonly userId: number }, trx?: TaskTransaction): Promise<GroupView[]>;

  getInfoGroups(specifications: TasksSpecification, trx?: TaskTransaction): Promise<GroupInfoView[]>;

  getOne(specifications: TasksSpecification, trx?: TaskTransaction): Promise<GroupView | null>;

  getGroupInfo(input: { groupId: number; userId: number }, trx?: TaskTransaction): Promise<{ taskCount: number }>;

  getSettings(input: { groupId: number; userId: number }, trx?: TaskTransaction): Promise<GroupSettingsView | null>;

  getManySettings(
    input: { readonly groupIds: number[]; readonly userId: number },
    trx?: TaskTransaction,
  ): Promise<GroupSettingsView[]>;

  ensureTaskInGroup(
    input: { userId: number; taskId: number; groupId: number },
    trx?: TaskTransaction,
  ): Promise<boolean>;

  getMany(
    specifications: TasksSpecification,
    params: { sort?: { name?: SortDirection; id?: SortDirection }; limit: number },
    trx?: TaskTransaction,
  ): Promise<GroupView[]>;
}

export { GroupsReadRepository };
