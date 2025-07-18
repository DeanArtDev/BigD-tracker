import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useDeleteThing() {
  const options = getDefaultQueryNotifications();

  const { mutate: deleteThing, ...states } = $privetQueryClient.useMutation(
    'delete',
    '/things/{thingId}',
    options,
  );

  return {
    deleteThing,
    ...states,
  };
}

export { useDeleteThing };
