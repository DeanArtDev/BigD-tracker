import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useExerciseDelete() {
  const options = getDefaultQueryNotifications();
  const { mutate: deleteTrigger, ...others } = $privetQueryClient.useMutation(
    'delete',
    '/exercises/{exerciseId}',
    { onError: options.onError },
  );

  return {
    deleteTrigger,
    ...others,
  };
}

export { useExerciseDelete };
