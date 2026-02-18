import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useAssignTaskToInbox() {
  const options = getDefaultQueryNotifications();

  const { mutate: assignTaskToInbox, ...states } = $privetQueryClient.useMutation(
    'post',
    '/tasks/{taskId}/in-box/assign',
    { onError: options.onError },
  );

  return {
    assignTaskToInbox,
    ...states,
  };
}

export { useAssignTaskToInbox };
