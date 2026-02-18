import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useUnassignTaskFromGroup() {
  const options = getDefaultQueryNotifications();

  const { mutate: unassignTaskFromGroup, ...states } = $privetQueryClient.useMutation(
    'post',
    '/tasks/{taskId}/groups/{groupId}/unassign',
    { onError: options.onError },
  );

  return {
    unassignTaskFromGroup,
    ...states,
  };
}

export { useUnassignTaskFromGroup };
