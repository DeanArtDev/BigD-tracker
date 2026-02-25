import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useDeleteCompleteTask() {
  const options = getDefaultQueryNotifications();

  const { mutate: deleteCompleteTask, ...states } = $privetQueryClient.useMutation(
    'delete',
    '/tasks/{taskId}/complete',
    { onError: options.onError },
  );

  return {
    deleteCompleteTask,
    ...states,
  };
}

export { useDeleteCompleteTask };
