import type { TaskInboxEntity } from '@/entity/planner/tasks';
import { $privetQueryClient } from '@/shared/api/api-client';
import { groupsQueryKeys } from './query';

function useGetUserInbox() {
  const { data, ...others } = $privetQueryClient.useQuery(...groupsQueryKeys.getInbox(), undefined, {
    select: (data): TaskInboxEntity[] => {
      return (data?.data ?? []).map<TaskInboxEntity>((task) => ({
        id: task.id,
        name: task.name,
        groupId: task.groupId,
        description: task.description,
        startDate: task.startDate,
        deadline: task.deadline,
        priority: task.priority,
        recurrence: task.recurrence,
      }));
    },
  });

  return {
    inbox: data,
    isEmpty: data?.length === 0,
    ...others,
  };
}

export { useGetUserInbox };
