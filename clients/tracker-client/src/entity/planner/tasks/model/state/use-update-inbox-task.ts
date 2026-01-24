import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useUpdateInboxTask() {
  const options = getDefaultQueryNotifications();
  const { mutate: updateInboxTask, ...states } = $privetQueryClient.useMutation(
    'put',
    '/tasks/{taskId}/inbox',
    { onError: options.onError },
  );

  return {
    updateInboxTask,
    ...states,
  };
}

export { useUpdateInboxTask };
