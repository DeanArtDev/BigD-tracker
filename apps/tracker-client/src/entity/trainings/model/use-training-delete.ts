import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTrainingDelete() {
  const options = getDefaultQueryNotifications();
  const { mutate: deleteTrigger, ...others } = $privetQueryClient.useMutation(
    'delete',
    '/trainings/{trainingId}',
    {
      ...options,
    },
  );

  return {
    deleteTrigger,
    ...others,
  };
}

export { useTrainingDelete };
