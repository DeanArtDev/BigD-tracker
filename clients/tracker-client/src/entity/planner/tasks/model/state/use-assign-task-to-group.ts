import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useAssignTaskToGroup() {
  const options = getDefaultQueryNotifications();

  const { mutate: assignTaskToGroup, ...states } = $privetQueryClient.useMutation(
    'post',
    '/tasks/{taskId}/groups/{groupId}',
    options,
  );

  return {
    assignTaskToGroup,
    ...states,
  };
}

export { useAssignTaskToGroup };
