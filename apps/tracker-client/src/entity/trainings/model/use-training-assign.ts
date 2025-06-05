import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTrainingAssign(
  options: {
    onSuccess?: () => Promise<void>;
  } = {},
) {
  const notifications = getDefaultQueryNotifications();
  const { mutate: assignTraining, ...others } = $privetQueryClient.useMutation(
    'post',
    '/trainings/assign',
    {
      ...notifications,
      onSuccess: options.onSuccess,
    },
  );

  return {
    assignTraining,
    ...others,
  };
}

export { useTrainingAssign };
