import { SortDirection } from '@big-d/api-contracts';
import { GroupInfoView, GroupView } from '../../dto';
import { TasksSpecification } from '../../specifications';
import { TaskTransaction } from '../transaction-manager.port';

interface GroupsReadRepository {
  getByName(input: { name: string; userId: number }, trx?: TaskTransaction): Promise<GroupView | null>;

  getInfoGroups(specifications: TasksSpecification, trx?: TaskTransaction): Promise<GroupInfoView[]>;

  getOne(specifications: TasksSpecification, trx?: TaskTransaction): Promise<GroupView | null>;

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
