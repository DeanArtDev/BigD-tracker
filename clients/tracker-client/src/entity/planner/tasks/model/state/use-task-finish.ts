import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTaskFinish() {
  const options = getDefaultQueryNotifications();

  const { mutate: finishTask, ...states } = $privetQueryClient.useMutation(
    'post',
    '/tasks/{taskId}/finish',
    options,
  );

  return {
    finishTask,
    ...states,
  };
}

export { useTaskFinish };
