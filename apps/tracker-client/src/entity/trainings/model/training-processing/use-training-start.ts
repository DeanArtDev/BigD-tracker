import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTrainingStart() {
  const options = getDefaultQueryNotifications();
  const { mutate: startTraining, ...others } = $privetQueryClient.useMutation(
    'post',
    '/trainings/{trainingId}/start',
    { onError: options.onError },
  );

  return {
    startTraining,
    ...others,
  };
}

export { useTrainingStart };
