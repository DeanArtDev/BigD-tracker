import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTaskClone() {
  const options = getDefaultQueryNotifications();

  const { mutate: cloneTask, ...states } = $privetQueryClient.useMutation(
    'post',
    '/tasks/{taskId}/clone',
    options,
  );

  return {
    cloneTask,
    ...states,
  };
}

export { useTaskClone };
