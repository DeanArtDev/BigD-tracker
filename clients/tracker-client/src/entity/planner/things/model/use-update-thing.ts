import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useUpdateThing() {
  const options = getDefaultQueryNotifications();
  const { mutate: updateThing, ...states } = $privetQueryClient.useMutation(
    'post',
    '/things/{thingId}',
    { onError: options.onError },
  );

  return {
    updateThing,
    ...states,
  };
}

export { useUpdateThing };
