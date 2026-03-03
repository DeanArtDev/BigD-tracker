import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTaskRecoveryTask() {
  const options = getDefaultQueryNotifications();

  const { mutate: recoveryTask, ...states } = $privetQueryClient.useMutation('post', '/tasks/{taskId}/recovery', {
    onError: options.onError,
  });

  return {
    recoveryTask,
    ...states,
  };
}

export { useTaskRecoveryTask };
