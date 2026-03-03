import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useExerciseUpdate() {
  const options = getDefaultQueryNotifications();
  const { mutate: update, ...others } = $privetQueryClient.useMutation('put', '/exercises/{exerciseId}/repetitions', {
    onError: options.onError,
  });

  return {
    update,
    ...others,
  };
}

export { useExerciseUpdate };
