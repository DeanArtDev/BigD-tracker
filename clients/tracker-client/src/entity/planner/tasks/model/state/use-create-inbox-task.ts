import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useCreateInboxTask() {
  const options = getDefaultQueryNotifications();
  const { mutate: createInboxTask, ...states } = $privetQueryClient.useMutation(
    'post',
    '/tasks/in-box',
    options,
  );

  return {
    createInboxTask,
    ...states,
  };
}

export { useCreateInboxTask };
