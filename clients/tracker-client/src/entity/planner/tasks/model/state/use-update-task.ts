import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useUpdateTask() {
  const options = getDefaultQueryNotifications();
  const { mutate: updateTask, ...states } = $privetQueryClient.useMutation('put', '/tasks/{taskId}', {
    onError: options.onError,
  });

  return {
    updateTask,
    ...states,
  };
}

export { useUpdateTask };
