import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useRepetitionSetFact() {
  const options = getDefaultQueryNotifications();
  const { mutate: setFact, ...others } = $privetQueryClient.useMutation(
    'post',
    '/trainings/{trainingId}/repetition/{repetitionId}/fact',
    { onError: options.onError },
  );

  return {
    setFact,
    ...others,
  };
}

export { useRepetitionSetFact };
