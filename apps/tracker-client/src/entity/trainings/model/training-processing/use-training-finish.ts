import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useTrainingFinish() {
  const options = getDefaultQueryNotifications();
  const { mutate: finishTraining, ...others } = $privetQueryClient.useMutation(
    'post',
    '/trainings/{trainingId}/finish',
    { onError: options.onError },
  );

  return {
    finishTraining,
    ...others,
  };
}

export { useTrainingFinish };
