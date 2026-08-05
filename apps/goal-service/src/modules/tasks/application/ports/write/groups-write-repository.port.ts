import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { GroupSettingsViewPatch } from '../../dto';
import { Task } from '@/modules/tasks/domain';
import { Group } from '@/modules/tasks/domain/aggregates/group';
import { TaskTransaction } from '../transaction-manager.port';

interface GroupsWriteRepository {
  createGroup(group: Group, trx?: TaskTransaction): Promise<Group>;

  updateGroupAndTaskOrder(input: { group: Group; taskIds?: Task['id'][] }, trx?: TaskTransaction): Promise<void>;

  updateSettings(input: { groupId: number; patch: GroupSettingsViewPatch }, trx?: TaskTransaction): Promise<boolean>;

  getGroup(specification: TasksSpecification, trx?: TaskTransaction): Promise<Group | null>;

  delete(specifications: TasksSpecification, trx?: TaskTransaction): Promise<boolean>;
}

export { GroupsWriteRepository };
