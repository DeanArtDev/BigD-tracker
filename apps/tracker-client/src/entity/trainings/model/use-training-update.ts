import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTrainingUpdate(
  options: {
    onSuccess?: () => Promise<void>;
  } = {},
) {
  const notifications = getDefaultQueryNotifications();
  const { mutate: update, ...others } = $privetQueryClient.useMutation(
    'patch',
    '/trainings/{trainingId}',
    {
      ...notifications,
      onSuccess: options.onSuccess,
    },
  );

  return {
    update,
    ...others,
  };
}

export { useTrainingUpdate };
