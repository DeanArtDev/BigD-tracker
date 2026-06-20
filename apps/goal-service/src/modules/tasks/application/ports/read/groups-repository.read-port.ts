import { GroupInfoView, GroupView, GroupWithTasksView } from '@/modules/tasks/application/dto';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { TaskTransaction } from '../transaction-manager.port';

interface GroupsReadRepository {
  getByName(input: { name: string; userId: number }, trx?: TaskTransaction): Promise<GroupView | null>;

  getInfoGroups(specifications: TasksSpecification, trx?: TaskTransaction): Promise<GroupInfoView[]>;

  getGroup(specifications: TasksSpecification, trx?: TaskTransaction): Promise<GroupView | null>;

  ensureTaskInGroup(
    input: { userId: number; taskId: number; groupId: number },
    trx?: TaskTransaction,
  ): Promise<boolean>;

  /**
   * @deprecated
   * will be deleted soon
   * */
  getGroupListWithTasks(
    groupSpecifications: TasksSpecification,
    taskSpecifications: TasksSpecification,
    params: { limit: number },
    trx?: TaskTransaction,
  ): Promise<GroupWithTasksView[]>;
}

export { GroupsReadRepository };
