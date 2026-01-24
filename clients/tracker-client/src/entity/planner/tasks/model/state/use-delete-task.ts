import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useDeleteTask() {
  const options = getDefaultQueryNotifications();

  const { mutate: deleteTask, ...states } = $privetQueryClient.useMutation(
    'delete',
    '/tasks/{taskId}',
    options,
  );

  return {
    deleteTask,
    ...states,
  };
}

export { useDeleteTask };
