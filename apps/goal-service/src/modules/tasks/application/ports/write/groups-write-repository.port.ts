import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { Group, GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { TaskTransaction } from '../transaction-manager.port';

interface GroupsWriteRepository {
  createGroup(group: Group, trx?: TaskTransaction): Promise<Group>;

  replaceGroupWithTasks(group: GroupWithTasks, trx?: TaskTransaction): Promise<void>;

  getGroupById(
    input: { groupId: number; userId: number; includeInbox?: boolean },
    trx?: TaskTransaction,
  ): Promise<GroupWithTasks | null>;

  delete(specifications: TasksSpecification, trx?: TaskTransaction): Promise<boolean>;
}

export { GroupsWriteRepository };
