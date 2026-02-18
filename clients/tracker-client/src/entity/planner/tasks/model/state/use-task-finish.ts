import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTaskFinish() {
  const options = getDefaultQueryNotifications();

  const { mutate: finishTask, ...states } = $privetQueryClient.useMutation(
    'post',
    '/tasks/{taskId}/finish',
    { onError: options.onError },
  );

  return {
    finishTask,
    ...states,
  };
}

export { useTaskFinish };
