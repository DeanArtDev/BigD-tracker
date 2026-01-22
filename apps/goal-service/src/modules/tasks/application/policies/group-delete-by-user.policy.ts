import { TasksDB } from '@/modules/tasks/application/ports';
import {
  GroupById,
  GroupByUserId,
  GroupInbox,
  groupsCombinators,
} from '@/modules/tasks/application/specifications';
import { tagSpec } from '@big-d/api-utils';

const { and, not } = groupsCombinators;

function GroupDeleteByUserPolicy(input: { userId: number; groupId: number }) {
  const spec = and(GroupById(input.groupId), GroupByUserId(input.userId), not(GroupInbox()));

  return tagSpec<TasksDB>(spec, {
    key: 'groups.policy.delete-by-user',
    purpose: 'policy',
  });
}

export { GroupDeleteByUserPolicy };
