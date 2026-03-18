import { taskInboxDtoToEntity, type TaskInboxEntity } from '@/entity/planner/tasks';
import { $privetQueryClient } from '@/shared/api/api-client';
import { groupsQueryKeys } from './query';

function useGetUserInbox() {
  const { data, ...others } = $privetQueryClient.useQuery(...groupsQueryKeys.getInbox(), undefined, {
    select: (data) => {
      return {
        id: data.data.id,
        name: data.data.name,
        items: data.data.tasks.map<TaskInboxEntity>(taskInboxDtoToEntity),
      };
    },
  });

  return {
    inbox: data,
    isEmpty: data?.items.length === 0,
    ...others,
  };
}

export { useGetUserInbox };
