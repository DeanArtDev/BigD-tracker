import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTrainingUpdate(
  options: {
    onSuccess?: () => Promise<void>;
  } = {},
) {
  const notifications = getDefaultQueryNotifications();
  const { mutate: updateTraining, ...others } = $privetQueryClient.useMutation(
    'put',
    '/trainings',
    {
      ...notifications,
      onSuccess: options.onSuccess,
    },
  );

  return {
    updateTraining,
    ...others,
  };
}

export { useTrainingUpdate };
