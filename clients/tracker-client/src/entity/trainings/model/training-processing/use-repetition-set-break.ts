import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useRepetitionSetBreak() {
  const options = getDefaultQueryNotifications();
  const { mutate: setBreak, ...others } = $privetQueryClient.useMutation(
    'post',
    '/trainings/{trainingId}/repetition/{repetitionId}/break',
    { onError: options.onError },
  );

  return {
    setBreak,
    ...others,
  };
}

export { useRepetitionSetBreak };
